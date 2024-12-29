'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, StopCircle, RefreshCw, ArrowRight } from 'lucide-react';
import styles from './BoringOMeter.module.css';
import axios from 'axios'

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

// Custom hook for speech recognition
const useSpeechRecognition = () => {
  const [transcript, setTranscript] = useState('');
  const recognition = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      recognition.current = new window.webkitSpeechRecognition();
      recognition.current.continuous = true;
      recognition.current.interimResults = true;
      
      recognition.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        setTranscript(finalTranscript);
      };
    }
  }, []);

  return { transcript, setTranscript, recognition };
};

const BoringOMeter = () => {
  const [step, setStep] = useState('prompt');
  const [currentPrompt, setCurrentPrompt] = useState(CONVERSATION_PROMPTS[0]); 
  const [isRecording, setIsRecording] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const { transcript, setTranscript, recognition } = useSpeechRecognition();
  const mediaRecorder = useRef(null);

  useEffect(() => {
    setCurrentPrompt(CONVERSATION_PROMPTS[Math.floor(Math.random() * CONVERSATION_PROMPTS.length)]);
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      recognition.current?.start();
      setIsRecording(true);
      setStep('recording');
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      recognition.current?.stop();
      setIsRecording(false);
      analyzeResponse();
    }
  };

  // *** CHANGED FUNCTION: Now it ONLY calls ChatGPT and sets a minimal analysis object. ***
  const analyzeResponse = async () => {
    let chatgptFeedback = '';
    console.log("transcript state ", transcript)
    try {
      const response = await axios.post('/api/analyze', {
        transcript: transcript
      });
      chatgptFeedback = response.data.feedback; 
    } catch (error) {
      console.error('Error calling ChatGPT:', error);
    }

    // Provide placeholders for score, metrics, improvements, etc.
    setAnalysis({
      score: 50,                   // Dummy / placeholder
      metrics: {},                 // Empty since we've removed our local analysis
      improvements: [],            // Empty placeholder
      chatgptFeedback,            // ChatGPT’s advice
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

  const resetApp = () => {
    setStep('prompt');
    setTranscript('');
    setAnalysis(null);
    setCurrentPrompt(CONVERSATION_PROMPTS[Math.floor(Math.random() * CONVERSATION_PROMPTS.length)]);
  };

  const renderTranscriptWithHighlights = () => {
    if (!analysis || !transcript) return transcript;
    // Since we're no longer generating improvements locally, just return the transcript as-is
    return <div>{transcript}</div>;
  };

  return (
    <div className={styles.container}>
      {step === 'prompt' && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <p style={{ textAlign: 'center' }}>Boring-O-Meter</p>
            <h2>🥱 How boring are you?</h2>
          </div>
          <div className={styles.cardContent}>
            <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
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
            <div className={styles.recordingIndicator} style={{ display: 'flex', justifyContent: 'center' }}>
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
};

export default BoringOMeter;
