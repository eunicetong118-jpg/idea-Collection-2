"use client";

import React from "react";
import { Rocket, ArrowUp, MessageSquare, Check } from "lucide-react";
import { FEATURE_FLAGS } from "@/lib/feature-flags";
import { clsx } from "clsx";

export default function HeroAnimation() {
  return (
    <div className="order-1 lg:order-2 relative px-4 sm:px-0 lg:pt-20">
      <div className="relative w-full max-w-lg mx-auto">
        {/* Main UI Mockup Card */}
        <div className={clsx(
          "rounded-2xl md:rounded-3xl p-4 md:p-6 relative z-20 shadow-[0_32px_64px_-16px_rgba(67,48,46,0.15)]",
          FEATURE_FLAGS.ENABLE_LIQUID_GLASS
            ? "glass-card"
            : "bg-white/80 backdrop-blur-xl border border-white/50"
        )}>
          {/* Header of mockup */}
          <div className={clsx(
            "flex justify-between items-center mb-4 md:mb-6 border-b pb-4",
            FEATURE_FLAGS.ENABLE_LIQUID_GLASS
              ? "border-white/10"
              : "border-lab-text/10"
          )}>
            <div className="flex items-center space-x-3">
              <div className={clsx(
                "w-10 h-10 rounded-full flex items-center justify-center",
                FEATURE_FLAGS.ENABLE_LIQUID_GLASS
                  ? "bg-white/20 text-white"
                  : "bg-lab-ui/50 text-lab-text"
              )}>
                <Rocket size={18} />
              </div>
              <div>
                <h3 className={clsx(
                  "font-bold text-sm md:text-base",
                  FEATURE_FLAGS.ENABLE_LIQUID_GLASS
                    ? "text-white"
                    : "text-lab-text"
                )}>New Product Feature</h3>
                <p className={clsx(
                  "text-[10px] md:text-xs font-medium uppercase tracking-wider",
                  FEATURE_FLAGS.ENABLE_LIQUID_GLASS
                    ? "text-white/60"
                    : "text-lab-text/60"
                )}>Submitted by Sarah J.</p>
              </div>
            </div>
            <div className={clsx(
              "px-3 py-1 rounded-full text-[10px] md:text-xs font-black shadow-sm uppercase tracking-widest",
              FEATURE_FLAGS.ENABLE_LIQUID_GLASS
                ? "bg-white/20 text-white border border-white/30"
                : "bg-white text-lab-text border border-lab-ui/20"
            )}>
              In Review
            </div>
          </div>

          {/* Body of mockup */}
          <div className="space-y-4 mb-6">
            <div className={clsx(
              "h-3 md:h-4 rounded-full w-3/4",
              FEATURE_FLAGS.ENABLE_LIQUID_GLASS
                ? "bg-white/10"
                : "bg-lab-text/10"
            )}></div>
            <div className={clsx(
              "h-3 md:h-4 rounded-full w-full",
              FEATURE_FLAGS.ENABLE_LIQUID_GLASS
                ? "bg-white/10"
                : "bg-lab-text/10"
            )}></div>
            <div className={clsx(
              "h-3 md:h-4 rounded-full w-5/6",
              FEATURE_FLAGS.ENABLE_LIQUID_GLASS
                ? "bg-white/10"
                : "bg-lab-text/10"
            )}></div>
          </div>

          {/* Interaction area */}
          <div className={clsx(
            "flex justify-between items-center rounded-2xl p-4 border",
            FEATURE_FLAGS.ENABLE_LIQUID_GLASS
              ? "bg-white/10 border-white/20"
              : "bg-white/50 border-white"
          )}>
            <div className="flex space-x-4">
              <button className={clsx(
                "flex items-center space-x-1 transition-colors",
                FEATURE_FLAGS.ENABLE_LIQUID_GLASS
                  ? "text-white hover:text-white/80"
                  : "text-lab-text hover:text-lab-ui"
              )}>
                <ArrowUp size={16} />
                <span className="font-bold text-xs md:text-sm">128</span>
              </button>
              <button className={clsx(
                "flex items-center space-x-1 transition-colors",
                FEATURE_FLAGS.ENABLE_LIQUID_GLASS
                  ? "text-white/60 hover:text-white"
                  : "text-lab-text/60 hover:text-lab-text"
              )}>
                <MessageSquare size={16} />
                <span className="font-medium text-xs md:text-sm">24</span>
              </button>
            </div>
            <div className="flex -space-x-2">
              <img
                className={clsx(
                  "w-6 h-6 rounded-full border",
                  FEATURE_FLAGS.ENABLE_LIQUID_GLASS
                    ? "border-white/30 bg-white/10"
                    : "border-white bg-lab-ui/20"
                )}
                src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg"
                alt="User"
              />
              <img
                className={clsx(
                  "w-6 h-6 rounded-full border",
                  FEATURE_FLAGS.ENABLE_LIQUID_GLASS
                    ? "border-white/30 bg-white/10"
                    : "border-white bg-lab-ui/20"
                )}
                src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg"
                alt="User"
              />
              <div className={clsx(
                "w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold shadow-inner",
                FEATURE_FLAGS.ENABLE_LIQUID_GLASS
                  ? "border-white/30 bg-white/20 text-white"
                  : "border-white bg-lab-ui text-lab-text"
              )}>+5</div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className={clsx(
          "absolute -top-6 -right-6 md:-top-10 md:-right-10 p-4 rounded-2xl z-30 shadow-[0_20px_40px_-12px_rgba(67,48,46,0.2)] animate-float",
          FEATURE_FLAGS.ENABLE_LIQUID_GLASS
            ? "glass-card"
            : "bg-white/90 backdrop-blur-xl border border-white/50"
        )}>
          <div className="flex items-center space-x-3">
            <div className={clsx(
              "w-8 h-8 rounded-full flex items-center justify-center",
              FEATURE_FLAGS.ENABLE_LIQUID_GLASS
                ? "bg-emerald-400/20 text-emerald-400"
                : "bg-emerald-100 text-emerald-600"
            )}>
              <Check size={16} />
            </div>
            <div>
              <p className={clsx(
                "text-xs font-black uppercase tracking-widest",
                FEATURE_FLAGS.ENABLE_LIQUID_GLASS
                  ? "text-white"
                  : "text-lab-text"
              )}>Idea Approved!</p>
              <p className={clsx(
                "text-[10px] font-medium italic",
                FEATURE_FLAGS.ENABLE_LIQUID_GLASS
                  ? "text-white/60"
                  : "text-lab-text/60"
              )}>Moving to development</p>
            </div>
          </div>
        </div>

        {/* Decorative background element */}
        <div className={clsx(
          "absolute -bottom-6 -left-6 md:-bottom-10 md:-left-10 w-32 h-32 rounded-full blur-3xl -z-10 animate-pulse",
          FEATURE_FLAGS.ENABLE_LIQUID_GLASS
            ? "bg-glass-secondary/30"
            : "bg-lab-ui/20"
        )} />
      </div>
    </div>
  );
}
