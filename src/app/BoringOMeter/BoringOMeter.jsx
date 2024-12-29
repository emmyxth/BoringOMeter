'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, StopCircle, RefreshCw, ArrowRight } from 'lucide-react';
import styles from './BoringOMeter.module.css';
import axios from 'axios';

//
// 1. Define conversation prompts
//
const CONVERSATION_PROMPTS = [
  "What's something funny that happened to you recently?",
  "Tell me about yourself - what makes you unique?",
  "What's the most interesting place you've ever visited?",
  "What's a skill you're really proud of and why?",
  "Tell me about a challenge you overcame recently",
  "What's the best advice someone's ever given you?",
  "What's a story your friends always ask you to tell?",
  "What's something you're really passionate about?",
  "Tell me about a moment that changed your perspective on life",
  "What's the most interesting conversation you've had lately?"
];

//
// 2. Custom Hook for Speech Recognition
//
function useSpeechRecognition(onComplete) {
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);
  const [lastResultIndex, setLastResultIndex] = useState(0);


  useEffect(() => {
    // Only set up speech recognition if the browser supports it
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;

      // On every result, append the finalized pieces to our transcript
        recognitionRef.current.onresult = (event) => {
        let newTranscript = '';

        // Only handle new results from `lastResultIndex`
        for (let i = lastResultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
            newTranscript += event.results[i][0].transcript;
            }
        }

        // Update the transcript state if there's any new text
        if (newTranscript) {
            setTranscript((prev) => prev + newTranscript);
        }

        // Update `lastResultIndex` so we don't re-append old data
        setLastResultIndex(event.results.length);
        };
    }
  }, [onComplete]);

  // Provide start and stop methods for the parent to control recognition
  const start = () => {
    recognitionRef.current?.start();
  };

  const stop = () => {
    recognitionRef.current?.stop();
  };

  return { transcript, setTranscript, start, stop };
}

//
// 3. Main BoringOMeter Component
//
export default function BoringOMeter() {
  // Steps: prompt -> recording -> results
  const [step, setStep] = useState('prompt');
  const [currentPrompt, setCurrentPrompt] = useState(CONVERSATION_PROMPTS[0]);
  const [isRecording, setIsRecording] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const mediaRecorder = useRef(null);

  // The callback that runs when speech ends
  const analyzeResponse = async () => {
    console.log("Final transcript state:", transcript);

    // Call ChatGPT (or any API) with the transcript
    let chatgptFeedback = '';
    try {
      const response = await axios.post('/api/analyze', { transcript });
      chatgptFeedback = response.data.feedback;
    } catch (error) {
      console.error('Error calling ChatGPT:', error);
    }

    // Example placeholder analysis
    setAnalysis({
      score: 50,                   // Dummy placeholder
      metrics: {},                 // (no local analysis for now)
      improvements: [],            // (placeholder)
      chatgptFeedback,
      generalTips: [
        "Vary your tone and pace to maintain interest",
        "Use specific examples to illustrate your points",
        "Include your listener by asking their opinion",
        "Share genuine emotions and reactions",
        "Keep stories concise and focused"
      ]
    });

    setStep('results');
  };

  // Use our custom hook, passing in analyzeResponse as the `onComplete` callback
  const { transcript, setTranscript, start, stop } = useSpeechRecognition(analyzeResponse);

  useEffect(() => {
    setCurrentPrompt(
      CONVERSATION_PROMPTS[Math.floor(Math.random() * CONVERSATION_PROMPTS.length)]
    );
  }, []);

  useEffect(() => {
    if (transcript && !isRecording) {
        analyzeResponse()
    }
    }, [isRecording])

  //
  // Start Recording: get user media, start speech recognition, etc.
  //
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);

      // Start speech recognition
      start();
      setIsRecording(true);
      setStep('recording');
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };

  //
  // Stop Recording: stop mediaRecorder (optional) + stop speech recognition
  //
  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
    }
    stop();
    console.log("STOPPED RECORDING")
    setIsRecording(false);

  };

  //
  // Reset everything
  //
  const resetApp = () => {
    setStep('prompt');
    setTranscript('');
    setAnalysis(null);
    setCurrentPrompt(
      CONVERSATION_PROMPTS[Math.floor(Math.random() * CONVERSATION_PROMPTS.length)]
    );
  };

  //
  // Optionally highlight transcript, but for now just display
  //
  const renderTranscriptWithHighlights = () => {
    if (!analysis || !transcript) return transcript;
    return <div>{transcript}</div>;
  };

  //
  // Render UI by step
  //
  return (
    <div className={styles.container}>
      {step === 'prompt' && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <p style={{ textAlign: 'center' }}>Boring-O-Meter</p>
            <h2>🥱 How boring are you?</h2>
          </div>
          <div className={styles.cardContent}>
            <div
              style={{
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1rem'
              }}
            >
              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Prompt</p>
              <p className={styles.promptText}>{currentPrompt}</p>
            </div>
            <button
              onClick={startRecording}
              className={`${styles.button} ${styles.primary}`}
            >
              <Mic className={styles.icon} />
              Try your luck
            </button>
          </div>
        </div>
      )}

      {step === 'recording' && (
        <div className={styles.card}>
          <div className={styles.cardContent}>
            <div
              className={styles.recordingIndicator}
              style={{ display: 'flex', justifyContent: 'center' }}
            >
              <Mic className={`${styles.icon} ${styles.recording}`} />
            </div>
            <button
              onClick={stopRecording}
              className={`${styles.button} ${styles.danger}`}
            >
              <StopCircle className={styles.icon} />
              Stop Recording
            </button>
          </div>
        </div>
      )}

      {step === 'results' && analysis && (
        <div className={styles.card}>
          <div className={styles.cardContent}>
            <h2>Engagement Score: {Math.round(analysis.score)}</h2>

            <div className={styles.progressBar}>
              <div
                className={styles.progressBarFill}
                style={{ width: `${analysis.score}%` }}
              />
            </div>

            <div className={styles.section}>
              <h3>Your Response:</h3>
              <div className={styles.transcript}>
                {renderTranscriptWithHighlights()}
              </div>
            </div>

            {analysis.chatgptFeedback && (
              <div className={styles.section}>
                <h3>ChatGPT Feedback:</h3>
                <p>{analysis.chatgptFeedback}</p>
              </div>
            )}

            <div className={styles.section}>
              <h3>Tips for Improvement:</h3>
              <ul className={styles.tipsList}>
                {analysis.generalTips.map((tip, index) => (
                  <li key={index}>
                    <ArrowRight className={styles.icon} />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={resetApp}
              className={`${styles.button} ${styles.primary} ${styles.fullWidth}`}
            >
              <RefreshCw className={styles.icon} />
              Try Another Prompt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
