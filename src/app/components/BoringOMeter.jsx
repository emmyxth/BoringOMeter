'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Mic, StopCircle, RefreshCw, ArrowRight, Loader2 } from 'lucide-react';
import EngagementScale from './EngagementScale';
import axios from 'axios';

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

function useSpeechRecognition(onComplete) {
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);
  const [lastResultIndex, setLastResultIndex] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let newTranscript = '';
        for (let i = lastResultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            newTranscript += event.results[i][0].transcript;
          }
        }
        if (newTranscript) {
          setTranscript((prev) => prev + newTranscript);
        }
        setLastResultIndex(event.results.length);
      };
    }
  }, [onComplete]);

  const start = () => {
    recognitionRef.current?.start();
  };

  const stop = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setLastResultIndex(0);
  };

  return { transcript, setTranscript, start, stop };
}

export default function BoringOMeter() {
  const [step, setStep] = useState('prompt');
  const [currentPrompt, setCurrentPrompt] = useState(CONVERSATION_PROMPTS[0]);
  const [isRecording, setIsRecording] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const mediaRecorder = useRef(null);

  const analyzeResponse = async () => {
    setStep('analyzing');
    try {
      const response = await axios.post('/api/analyze', { transcript });
      const feedbackRawObject = response.data.feedback;
      const chatgptFeedbackJson = JSON.parse(feedbackRawObject);
      const engagementScore = chatgptFeedbackJson.Score;
      const chatgptFeedback = chatgptFeedbackJson.Feedback;

      setAnalysis({
        score: engagementScore,
        metrics: {},
        improvements: [],
        chatgptFeedback,
        generalTips: [
          "Vary your tone and pace to maintain interest",
          "Use specific examples to illustrate your points",
          "Share genuine emotions and reactions",
          "Keep stories concise and focused"
        ]
      });
      setStep('results');
    } catch (error) {
      console.error('Error calling ChatGPT:', error);
    }
  };

  const { transcript, setTranscript, start, stop } = useSpeechRecognition(analyzeResponse);

  useEffect(() => {
    setCurrentPrompt(
      CONVERSATION_PROMPTS[Math.floor(Math.random() * CONVERSATION_PROMPTS.length)]
    );
  }, []);

  useEffect(() => {
    if (transcript && !isRecording) {
      analyzeResponse();
    }
  }, [isRecording, transcript]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      start();
      setIsRecording(true);
      setStep('recording');
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
    }
    stop();
    setIsRecording(false);
  };

  const resetApp = () => {
    setStep('prompt');
    setTranscript('');
    setAnalysis(null);
    setCurrentPrompt(
      CONVERSATION_PROMPTS[Math.floor(Math.random() * CONVERSATION_PROMPTS.length)]
    );
  };

  return (
    <div className="mx-auto p-6 flex items-center justify-center h-screen">
      {step === 'prompt' && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg p-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Boring-O-Meter
            </h1>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="text-xl font-medium text-gray-700">How boring are you?</span>
              <span className="text-2xl animate-bounce">🥱</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Prompt</h2>
            <p className="text-gray-600 text-lg">{currentPrompt}</p>
          </div>

          <button
            onClick={startRecording}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-lg text-white font-medium bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
          >
            <Mic className="w-6 h-6" />
            <span>Try your luck</span>
          </button>
        </div>
      )}

      {step === 'recording' && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg p-6">
          <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Prompt</h2>
            <p className="text-gray-600 text-lg">{currentPrompt}</p>
          </div>

          <div className="flex justify-center mb-6">
            <Mic className="w-12 h-12 text-red-500 animate-pulse" />
          </div>

          <button
            onClick={stopRecording}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-lg text-white font-medium bg-red-500 hover:bg-red-600 transition-all duration-300"
          >
            <StopCircle className="w-6 h-6" />
            <span>Stop Recording</span>
          </button>
        </div>
      )}

      {step === 'analyzing' && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-700 mb-6">Analyzing your response...</h2>
            <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto" />
          </div>
        </div>
      )}

      {step === 'results' && analysis && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg p-10 mt-10">
          <EngagementScale score={analysis.score} />

          <div className="bg-white rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Your Response:</h3>
            <p className="text-gray-600">{transcript}</p>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {analysis.chatgptFeedback && (
              <div className="bg-white rounded-xl p-6 mb-6 md:w-1/2">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">ChatGPT Feedback:</h3>
                <p className="text-gray-600">{analysis.chatgptFeedback}</p>
              </div>
            )}

            <div className="bg-white rounded-xl p-6 mb-6 md:w-1/2">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Tips for Improvement:</h3>
              <ul className="space-y-3">
                {analysis.generalTips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-3 text-gray-600">
                    <ArrowRight className="w-5 h-5 mt-1 flex-shrink-0 text-purple-500" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          
          <div className="flex items-center justify-center">          
            <button
            onClick={resetApp}
            className="w-[20%] flex items-center justify-center gap-3 py-4 px-6 rounded-lg text-white font-medium bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
          >
            <RefreshCw className="w-6 h-6" />
            <span>Try Another Prompt</span>
          </button></div>
        </div>
      )}
    </div>
  );
}