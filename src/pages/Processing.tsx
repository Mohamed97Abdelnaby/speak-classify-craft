import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import LoadingSpinner from "@/components/LoadingSpinner";

const Processing = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentMessage, setCurrentMessage] = useState(0);
  const batchId = searchParams.get('batch');
  
  const statusMessages = [
    "Listening to calls…",
    "Taking decision on calls…",
    "Analyzing conversation patterns…",
    "Processing audio content…",
    "Applying AI classification…"
  ];
  
  useEffect(() => {
    // Check if batch exists
    if (batchId) {
      const batchData = localStorage.getItem(`batch-${batchId}`);
      if (!batchData) {
        navigate("/");
        return;
      }
    }

    // Rotate messages every 3 seconds
    const messageInterval = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % statusMessages.length);
    }, 3000);

    // Auto navigate after 10 seconds
    const navigationTimer = setTimeout(() => {
      navigate(`/review?batch=${batchId}`);
    }, 10000);

    return () => {
      clearInterval(messageInterval);
      clearTimeout(navigationTimer);
    };
  }, [navigate, batchId]);


  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <LoadingSpinner message={statusMessages[currentMessage]} />
        </div>
      </main>
    </div>
  );
};

export default Processing;