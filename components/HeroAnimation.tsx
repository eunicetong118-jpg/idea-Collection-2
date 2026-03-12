"use client";

import React from "react";
import { Rocket, ArrowUp, MessageSquare, Check } from "lucide-react";

export default function HeroAnimation() {
  return (
    <div className="order-1 lg:order-2 relative px-4 sm:px-0 lg:pt-20">
      <div className="relative w-full max-w-lg mx-auto">
        {/* Main UI Mockup Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl md:rounded-3xl p-4 md:p-6 relative z-20 shadow-[0_32px_64px_-16px_rgba(67,48,46,0.15)] border border-white/50">
          {/* Header of mockup */}
          <div className="flex justify-between items-center mb-4 md:mb-6 border-b border-lab-text/10 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-lab-ui/50 flex items-center justify-center text-lab-text">
                <Rocket size={18} />
              </div>
              <div>
                <h3 className="font-bold text-lab-text text-sm md:text-base">New Product Feature</h3>
                <p className="text-[10px] md:text-xs text-lab-text/60 font-medium uppercase tracking-wider">Submitted by Sarah J.</p>
              </div>
            </div>
            <div className="bg-white px-3 py-1 rounded-full text-[10px] md:text-xs font-black text-lab-text shadow-sm uppercase tracking-widest border border-lab-ui/20">
              In Review
            </div>
          </div>

          {/* Body of mockup */}
          <div className="space-y-4 mb-6">
            <div className="h-3 md:h-4 bg-lab-text/10 rounded-full w-3/4"></div>
            <div className="h-3 md:h-4 bg-lab-text/10 rounded-full w-full"></div>
            <div className="h-3 md:h-4 bg-lab-text/10 rounded-full w-5/6"></div>
          </div>

          {/* Interaction area */}
          <div className="flex justify-between items-center bg-white/50 rounded-2xl p-4 border border-white">
            <div className="flex space-x-4">
              <button className="flex items-center space-x-1 text-lab-text hover:text-lab-ui transition-colors">
                <ArrowUp size={16} />
                <span className="font-bold text-xs md:text-sm">128</span>
              </button>
              <button className="flex items-center space-x-1 text-lab-text/60 hover:text-lab-text transition-colors">
                <MessageSquare size={16} />
                <span className="font-medium text-xs md:text-sm">24</span>
              </button>
            </div>
            <div className="flex -space-x-2">
              <img
                className="w-6 h-6 rounded-full border border-white bg-lab-ui/20"
                src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg"
                alt="User"
              />
              <img
                className="w-6 h-6 rounded-full border border-white bg-lab-ui/20"
                src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg"
                alt="User"
              />
              <div className="w-6 h-6 rounded-full border border-white bg-lab-ui flex items-center justify-center text-[10px] font-bold text-lab-text shadow-inner">+5</div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute -top-6 -right-6 md:-top-10 md:-right-10 bg-white/90 backdrop-blur-xl p-4 rounded-2xl z-30 shadow-[0_20px_40px_-12px_rgba(67,48,46,0.2)] border border-white/50 animate-float">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <Check size={16} />
            </div>
            <div>
              <p className="text-xs font-black text-lab-text uppercase tracking-widest">Idea Approved!</p>
              <p className="text-[10px] text-lab-text/60 font-medium italic">Moving to development</p>
            </div>
          </div>
        </div>

        {/* Decorative background element */}
        <div className="absolute -bottom-6 -left-6 md:-bottom-10 md:-left-10 w-32 h-32 bg-lab-ui/20 rounded-full blur-3xl -z-10 animate-pulse" />
      </div>
    </div>
  );
}
