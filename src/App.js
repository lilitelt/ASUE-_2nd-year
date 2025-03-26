import React, { useState, useRef, useEffect } from 'react';
import { Mic, StopCircle, Play, Pause } from 'lucide-react';

const DiscussionQuestions = [
  "How has technology changed the way businesses operate?",
  "How do managers keep employees motivated?",
  "How should managers handle workplace conflicts?",
  "Why is networking important for career growth?",
  "Why is market research important? Discuss different methods businesses use to gather data on customers."
];

const getFeedbackForQuestion = (question, response) => {
  // Basic language level B1 feedback function
  const wordCount = response.trim().split(/\s+/).length;
  const sentenceCount = response.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  
  const contentFeedback = {
    0: "Try to provide more details and specific examples.",
    1: "Good start, but you could expand on your ideas.",
    2: "Nice response with some good points!",
    3: "Excellent answer with clear explanations!"
  };

  const languageFeedback = {
    grammar: [
      "Consider using more complex sentence structures.",
      "Check your verb tenses and agreement.",
      "Try to use more specific vocabulary related to the topic."
    ],
    vocabulary: [
      "Use more business-related vocabulary.",
      "Try to vary your word choice.",
      "Include some professional terminology."
    ]
  };

  // Generate content feedback based on word count and depth
  const contentLevel = wordCount < 20 ? 0 : 
                       wordCount < 40 ? 1 : 
                       wordCount < 70 ? 2 : 3;

  // Randomly select language feedback
  const grammarTip = languageFeedback.grammar[Math.floor(Math.random() * languageFeedback.grammar.length)];
  const vocabTip = languageFeedback.vocabulary[Math.floor(Math.random() * languageFeedback.vocabulary.length)];

  return {
    contentFeedback: contentFeedback[contentLevel],
    languageFeedback: `${grammarTip} ${vocabTip}`,
    wordCount: wordCount,
    sentenceCount: sentenceCount
  };
};

const InterviewPracticeApp = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [response, setResponse] = useState('');
  const [feedback, setFeedback] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  const startRecording = async () => {
    audioChunksRef.current = [];
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    
    mediaRecorderRef.current.ondataavailable = (e) => {
      audioChunksRef.current.push(e.data);
    };
    
    mediaRecorderRef.current.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const audioUrl = URL.createObjectURL(audioBlob);
      setRecordedAudio(audioUrl);
    };

    mediaRecorderRef.current.start();
    setIsRecording(true);
    
    // Start countdown timer
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          stopRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
      
      // Generate feedback
      const feedbackResults = getFeedbackForQuestion(
        DiscussionQuestions[currentQuestion], 
        response
      );
      setFeedback(feedbackResults);
    }
  };

  const moveToNextQuestion = () => {
    // Reset for next question
    setTimeRemaining(60);
    setRecordedAudio(null);
    setResponse('');
    setFeedback(null);
    
    // Move to next question or reset to first if at end
    setCurrentQuestion((prev) => 
      prev < DiscussionQuestions.length - 1 ? prev + 1 : 0
    );
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-gray-100 min-h-screen">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-xl font-bold mb-4 text-center">Interview Practice</h1>
        
        {/* Question Display */}
        <div className="mb-4">
          <p className="text-lg font-semibold text-center">
            {DiscussionQuestions[currentQuestion]}
          </p>
        </div>
        
        {/* Timer */}
        <div className="text-center mb-4">
          <p className="text-2xl font-bold text-blue-600">
            Time Remaining: {timeRemaining} seconds
          </p>
        </div>
        
        {/* Response Input */}
        <textarea 
          className="w-full p-2 border rounded mb-4"
          placeholder="Type your response here..."
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          disabled={isRecording ? false : true}
          rows={4}
        />
        
        {/* Recording Controls */}
        <div className="flex justify-center space-x-4 mb-4">
          {!isRecording ? (
            <button 
              onClick={startRecording} 
              className="bg-green-500 text-white p-2 rounded flex items-center"
            >
              <Mic className="mr-2" /> Start Recording
            </button>
          ) : (
            <button 
              onClick={stopRecording} 
              className="bg-red-500 text-white p-2 rounded flex items-center"
            >
              <StopCircle className="mr-2" /> Stop Recording
            </button>
          )}
        </div>
        
        {/* Recorded Audio Playback */}
        {recordedAudio && (
          <div className="mb-4 text-center">
            <audio controls src={recordedAudio} className="mx-auto" />
          </div>
        )}
        
        {/* Feedback Section */}
        {feedback && (
          <div className="bg-blue-50 p-4 rounded">
            <h2 className="font-bold mb-2">Feedback</h2>
            <p><strong>Content:</strong> {feedback.contentFeedback}</p>
            <p><strong>Language:</strong> {feedback.languageFeedback}</p>
            <p><strong>Word Count:</strong> {feedback.wordCount}</p>
            <p><strong>Sentence Count:</strong> {feedback.sentenceCount}</p>
            
            <button 
              onClick={moveToNextQuestion}
              className="mt-4 bg-blue-500 text-white p-2 rounded"
            >
              Next Question
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewPracticeApp;
