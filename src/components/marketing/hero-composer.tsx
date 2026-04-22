"use client";

import { useState } from "react";
import { ArrowUp, Mic, Paperclip, Search, Sparkles, Upload } from "lucide-react";

export function HeroComposer() {
  const [question, setQuestion] = useState("");

  return (
    <div className="w-full max-w-[728px] rounded-[18px] bg-[rgba(0,0,0,0.24)] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.18)] backdrop-blur-[18px]">
      <div className="font-sans mb-4 flex items-center justify-between text-[12px] font-medium text-white">
        <div className="flex items-center gap-3">
          <span>42 live galleries</span>
          <button
            type="button"
            className="rounded-full bg-[rgba(90,225,76,0.89)] px-3 py-1 text-[12px] text-black"
          >
            Upgrade branding
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Private originals + access codes</span>
        </div>
      </div>

      <div className="flex h-[148px] flex-col rounded-[12px] bg-white px-4 py-4 shadow-[0_12px_30px_rgba(0,0,0,0.12)]">
        <label htmlFor="landing-hero-composer" className="sr-only">
          Describe the gallery workflow you want to build
        </label>
        <div className="flex-1">
          <input
            id="landing-hero-composer"
            name="landingPrompt"
            value={question}
            onChange={(event) => setQuestion(event.target.value.slice(0, 3000))}
            autoComplete="off"
            spellCheck={false}
            placeholder="Describe the gallery flow you want to ship next..."
            className="font-body h-full w-full border-none bg-transparent text-[16px] text-black outline-none placeholder:text-[rgba(0,0,0,0.6)] focus-visible:outline-none"
          />
        </div>

        <div className="mt-4 flex items-end justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { label: "Uploads", icon: Upload },
              { label: "Voice", icon: Mic },
              { label: "Prompts", icon: Search },
            ].map((action) => {
              const Icon = action.icon;

              return (
                <button
                  key={action.label}
                  type="button"
                  className="font-body inline-flex items-center gap-2 rounded-[6px] bg-[#f8f8f8] px-3 py-2 text-[14px] font-medium text-black"
                >
                  <Icon className="h-4 w-4" />
                  {action.label}
                </button>
              );
            })}
            <button
              type="button"
              className="font-body inline-flex items-center gap-2 rounded-[6px] bg-[#f8f8f8] px-3 py-2 text-[14px] font-medium text-black"
            >
              <Paperclip className="h-4 w-4" />
              Access codes
            </button>
          </div>

          <div className="flex items-end gap-3">
            <span className="font-body text-[12px] text-[#505050]">
              {question.length.toLocaleString()}/3,000
            </span>
            <button
              type="button"
              aria-label="Submit"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
