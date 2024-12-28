'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, StopCircle, RefreshCw, MessageCircle, ArrowRight } from 'lucide-react';
import styles from './BoringOMeter.module.css';

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
    // Only initialize speech recognition on the client side
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
  const [currentPrompt, setCurrentPrompt] = useState(CONVERSATION_PROMPTS[0]); // Start with a stable initial value
  const [isRecording, setIsRecording] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  
  const { transcript, setTranscript, recognition } = useSpeechRecognition();
  const mediaRecorder = useRef(null);

  // Move prompt randomization to a useEffect
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

  const analyzeResponse = () => {
    const words = transcript.split(' ');
    const sentences = transcript.split(/[.!?]+/).filter(Boolean);
    const improvements = [];
    
    sentences.forEach((sentence, idx) => {
      if (sentence.split(' ').length > 30) {
        improvements.push({
          type: 'long_sentence',
          text: sentence,
          suggestion: 'Break this into smaller, more digestible points',
          position: transcript.indexOf(sentence)
        });
      }
    });
    
    const fillerWords = ['um', 'uh', 'like', 'you know', 'sort of'];
    fillerWords.forEach(filler => {
      let position = transcript.toLowerCase().indexOf(filler);
      while (position !== -1) {
        improvements.push({
          type: 'filler',
          text: filler,
          suggestion: 'Remove filler word',
          position: position
        });
        position = transcript.toLowerCase().indexOf(filler, position + 1);
      }
    });
    
    const metrics = {
      wordVariety: new Set(words).size / words.length,
      avgSentenceLength: words.length / sentences.length,
      personalPronouns: (transcript.match(/\b(I|me|my|we|our)\b/gi) || []).length,
      questions: (transcript.match(/\?/g) || []).length,
      emotionalWords: (transcript.match(/\b(love|hate|feel|felt|excited|amazing|wonderful|terrible)\b/gi) || []).length
    };
    
    const score = Math.min(100, Math.max(0,
      (metrics.wordVariety * 20) +
      (Math.min(1, Math.max(0, (15 - Math.abs(15 - metrics.avgSentenceLength)) / 15)) * 20) +
      (Math.min(1, metrics.personalPronouns / 5) * 20) +
      (Math.min(1, metrics.questions / 2) * 20) +
      (Math.min(1, metrics.emotionalWords / 3) * 20)
    ));

    setAnalysis({
      score,
      metrics,
      improvements,
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
    
    let highlightedText = transcript;
    const highlights = analysis.improvements.sort((a, b) => b.position - a.position);
    
    highlights.forEach(improvement => {
      const before = highlightedText.slice(0, improvement.position);
      const after = highlightedText.slice(improvement.position + improvement.text.length);
      highlightedText = `${before}<mark title="${improvement.suggestion}">${improvement.text}</mark>${after}`;
    });
    
    return <div dangerouslySetInnerHTML={{ __html: highlightedText }} />;
  };

  return (
    <div className={styles.container}>
      {step === 'prompt' && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
          <p style={{ textAlign: 'center' }}>              
            Boring-O-Meter
            </p>
            <h2 >
              {/* <MessageCircle className={styles.icon} /> */}
            🥱
              How boring are you?
            </h2>
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