'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useSyncExternalStore } from 'react'

function useIsSupported() {
  return useSyncExternalStore(
    () => () => {},
    () => 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window,
    () => true,
  )
}

export default function Home() {
  const [text, setText] = useState('')
  const [interimText, setInterimText] = useState('')
  const [isListening, setIsListening] = useState(false)
  const isSupported = useIsSupported()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const cursorPosRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [])

  const syncCursor = useCallback(() => {
    if (textareaRef.current) {
      cursorPosRef.current = textareaRef.current.selectionStart
    }
  }, [])

  const insertAtCursor = useCallback((insertText: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    let pos = cursorPosRef.current
    if (pos === null) pos = textarea.selectionStart

    setText(prev => {
      const before = prev.slice(0, pos)
      const after = prev.slice(pos)
      const separator = before && !before.endsWith(' ') && !before.endsWith('\n') ? ' ' : ''
      const newText = before + separator + insertText + after
      cursorPosRef.current = pos + separator.length + insertText.length
      return newText
    })

    requestAnimationFrame(() => {
      textarea.focus()
      const cp = cursorPosRef.current
      if (cp !== null) textarea.setSelectionRange(cp, cp)
    })
  }, [])

  const startListening = useCallback(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognitionAPI) return

    const recognition = new SpeechRecognitionAPI()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = ''
      let currentInterim = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          const t = event.results[i][0].transcript
          finalTranscript += t
        } else {
          currentInterim += event.results[i][0].transcript
        }
      }

      if (finalTranscript) {
        insertAtCursor(finalTranscript)
      }

      setInterimText(currentInterim)
    }

    recognition.onerror = () => {
      setIsListening(false)
      setInterimText('')
    }

    recognition.onend = () => {
      setIsListening(false)
      setInterimText('')
    }

    recognition.start()
    recognitionRef.current = recognition
    setIsListening(true)
  }, [insertAtCursor])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setIsListening(false)
    setInterimText('')
  }, [])

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening()
    } else {
      syncCursor()
      startListening()
    }
  }, [isListening, startListening, stopListening, syncCursor])

  const copyText = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
  }, [text])

  const clearText = useCallback(() => {
    setText('')
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [])

  if (!isSupported) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
          <p className="text-lg text-slate-700">
            Speech recognition is not supported in this browser.
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Please use Chrome, Edge, or Safari.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        <header className="text-center">
          <h1 className="font-[family-name:var(--font-serif)] text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Convert speech to text, instantly
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-500 sm:text-lg">
            A free, browser-based voice transcription tool. Click the microphone,
            speak, and watch your words appear in real time.
          </p>
        </header>

        <div className="mt-12 space-y-4">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => {
              setText(e.target.value)
              syncCursor()
            }}
            onClick={syncCursor}
            onKeyUp={syncCursor}
            placeholder="Place the cursor where you want speech to appear, then click Start Listening..."
            className="h-72 w-full resize-y rounded-lg border border-slate-200 bg-white p-5 text-base leading-relaxed text-slate-800 placeholder-slate-400 outline-none transition-colors focus:border-slate-400 focus:ring-1 focus:ring-slate-400 sm:h-80 sm:text-lg"
          />

          {interimText && (
            <div className="-mt-2 min-h-[1.5rem] rounded-lg bg-slate-50 px-4 py-2 text-sm text-slate-400 italic">
              {interimText}
              <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-slate-400 align-middle" />
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={toggleListening}
              className={`flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium transition-all ${
                isListening
                  ? 'bg-red-500 text-white shadow-sm hover:bg-red-400'
                  : 'bg-slate-900 text-white shadow-sm hover:bg-slate-700'
              }`}
            >
              <span
                className={`h-3 w-3 rounded-full ${
                  isListening ? 'animate-pulse bg-red-200' : 'bg-white/70'
                }`}
              />
              {isListening ? 'Stop Listening' : 'Start Listening'}
            </button>

            <button
              onClick={copyText}
              disabled={!text}
              className="rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Copy Text
            </button>

            <button
              onClick={clearText}
              disabled={!text}
              className="rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Clear
            </button>
          </div>

          <p className="pt-1 text-center text-xs text-slate-400">
            {isListening
              ? 'Listening... speak into your microphone'
              : 'Click "Start Listening" and grant microphone permission'}
          </p>
        </div>

        <hr className="my-16 border-slate-100" />

        <section className="text-center">
          <h2 className="font-[family-name:var(--font-serif)] text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            How it works
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-base text-slate-500">
            Everything runs in your browser using the Web Speech API. No audio
            is sent to any server — your voice never leaves your device.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-6">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-medium text-white">
                1
              </div>
              <h3 className="mt-4 font-medium text-slate-900">Place your cursor</h3>
              <p className="mt-1 text-sm text-slate-500">
                Click anywhere in the text area. That is where your words will
                appear.
              </p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-6">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-medium text-white">
                2
              </div>
              <h3 className="mt-4 font-medium text-slate-900">Start speaking</h3>
              <p className="mt-1 text-sm text-slate-500">
                Press the microphone button and grant permission when prompted.
              </p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-6">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-medium text-white">
                3
              </div>
              <h3 className="mt-4 font-medium text-slate-900">Edit freely</h3>
              <p className="mt-1 text-sm text-slate-500">
                Type, delete, or move the cursor anytime. Speech text inserts
                exactly where you need it.
              </p>
            </div>
          </div>
        </section>

        <footer className="mt-16 text-center text-xs text-slate-400">
          Powered by the Web Speech API &mdash; no data leaves your device.
        </footer>
      </div>
    </div>
  )
}
