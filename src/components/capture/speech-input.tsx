"use client";

import { useSpeech } from "@/hooks/use-speech";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpeechInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SpeechInput({ value, onChange, placeholder }: SpeechInputProps) {
  const { isListening, transcript, startListening, stopListening, resetTranscript, isSupported } =
    useSpeech();

  // Sync transcript to parent when it changes
  function handleToggle() {
    if (isListening) {
      stopListening();
      // Append transcript to existing value
      if (transcript) {
        const newValue = value ? value + " " + transcript : transcript;
        onChange(newValue.trim());
        resetTranscript();
      }
    } else {
      resetTranscript();
      startListening();
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm">Job Story</h3>
        {isSupported && (
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant={isListening ? "destructive" : "outline"}
              onClick={handleToggle}
              className="gap-1"
            >
              {isListening ? (
                <>
                  <MicOff className="w-3 h-3" /> Stop
                </>
              ) : (
                <>
                  <Mic className="w-3 h-3" /> Speak
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Live transcript indicator */}
      {isListening && (
        <div className="flex items-center gap-2 text-sm text-red-500 animate-pulse">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          Listening... speak about the job
        </div>
      )}

      {/* Show interim transcript */}
      {isListening && transcript && (
        <div className="p-3 rounded-lg bg-muted text-sm text-muted-foreground italic">
          {transcript}
        </div>
      )}

      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={
          placeholder ||
          "Describe the job... What did you do? What was the problem? How did you fix it? Any interesting details?"
        }
        rows={4}
        className="resize-none"
      />
      <p className="text-xs text-muted-foreground">
        Tap Speak to dictate or type manually. Be descriptive — AI will polish this into a story.
      </p>
    </div>
  );
}
