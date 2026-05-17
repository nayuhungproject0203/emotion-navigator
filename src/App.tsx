/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Copy, Check, Heart, Info, Download, PenLine, Lightbulb, Sun, Navigation, Target, MoveRight } from 'lucide-react';
import { toPng } from 'html-to-image';
import { emotionTree, type EmotionNode } from "./data/emotions";
import { Locale, t } from "./i18n";

// --- Types ---
type Step = 'home' | 'about' | 'level1' | 'level2' | 'level3' | 'result' | 'reflection' | 'reflectionResult';
type ReflectionPath = 'control' | 'grey' | 'acceptance' | 'savor_record' | 'savor_insight' | 'savor_action' | null;

import Layout from './components/Layout';
import Header from './components/Header';
import EmotionButton from './components/EmotionButton';

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
    }
    return 'dark';
  });
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('locale') as Locale) || 'zh-TW';
    }
    return 'zh-TW';
  });
  const [step, setStep] = useState<Step>('home');
  const [history, setHistory] = useState<EmotionNode[][]>([]);
  const [selections, setSelections] = useState<EmotionNode[]>([]);
  const [copied, setCopied] = useState(false);
  const [reflectionPath, setReflectionPath] = useState<ReflectionPath>(null);
  const [reflectionSubStep, setReflectionSubStep] = useState(0);

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('locale', locale);
  }, [locale]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  const toggleLocale = (l: Locale) => setLocale(l);

  // --- Handlers ---

  const handleStart = () => {
    setStep('level1');
    setHistory([]);
    setSelections([]);
  };

  const handleSelect = (node: EmotionNode) => {
    const newSelections = [...selections, node];
    setSelections(newSelections);
    
    if (node.children && node.children.length > 0) {
      setHistory([...history, selections]);
      if (step === 'level1') setStep('level2');
      else if (step === 'level2') setStep('level3');
    } else {
      setStep('result');
    }
  };

  const handleBack = () => {
    if (step === 'level1' || step === 'about') {
      setStep('home');
    } else if (step === 'level2') {
      setStep('level1');
      setSelections([]);
    } else if (step === 'level3') {
      setStep('level2');
      setSelections(selections.slice(0, 1));
    } else if (step === 'result') {
      setStep('level3');
      setSelections(selections.slice(0, 2));
    } else if (step === 'reflection') {
      if (reflectionSubStep > 0) {
        setReflectionSubStep(reflectionSubStep - 1);
      } else {
        setStep('result');
      }
    } else if (step === 'reflectionResult') {
      setStep('reflection');
      // If it was a savor path, we go back to the selection
      if (selections[2]?.reflectionMode === 'savor') {
        setReflectionSubStep(0);
      } else {
        setReflectionSubStep(1); // Go back to the last question
      }
    }
  };

  const handleRestart = () => {
    setStep('home');
    setSelections([]);
    setHistory([]);
    setReflectionPath(null);
    setReflectionSubStep(0);
  };

  const handleCopyResult = async () => {
    const pathText = selections.map(s => t(locale, s.labelKey)).join(' → ');
    let reflectionText = "";
    
    if (reflectionPath === 'control') reflectionText = `\n${t(locale, 'reflectionResult.control.directive')}`;
    if (reflectionPath === 'grey') reflectionText = `\n${t(locale, 'reflectionResult.grey.directive')}`;
    if (reflectionPath === 'acceptance') reflectionText = `\n${t(locale, 'reflectionResult.acceptance.directive', { emotion: t(locale, selections[2]?.labelKey) })}`;
    if (reflectionPath === 'savor_record') reflectionText = `\n${t(locale, 'reflectionResult.savor_record.directive', { emotion: t(locale, selections[2]?.labelKey) })}`;
    if (reflectionPath === 'savor_insight') reflectionText = `\n${t(locale, 'reflectionResult.savor_insight.directive')}`;
    if (reflectionPath === 'savor_action') reflectionText = `\n${t(locale, 'reflectionResult.savor_action.directive', { emotion: t(locale, selections[2]?.labelKey) })}`;

    const text = t(locale, 'reflectionResult.copyLog', { path: pathText, suggestion: reflectionText });
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handleDownloadImage = async () => {
    const node = document.getElementById('reflection-result-card');
    if (node) {
      try {
        const dataUrl = await toPng(node, { backgroundColor: '#F8F9FA', cacheBust: true });
        const link = document.createElement('a');
        link.download = `mind-clarity-${new Date().getTime()}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Failed to download image: ', err);
      }
    }
  };

  // --- Computed ---

  const currentOptions = useMemo(() => {
    if (step === 'level1') return emotionTree;
    if (step === 'level2') return selections[0]?.children || [];
    if (step === 'level3') return selections[1]?.children || [];
    return [];
  }, [step, selections]);

  const resultSentence = useMemo(() => {
    if (selections.length < 3) return "";
    return t(locale, selections[2].labelKey);
  }, [selections, locale]);

  const resultColor = useMemo(() => {
    if (selections.length === 0) return "#10B981"; // Default emerald
    const rootEmotion = emotionTree.find(e => e.id === selections[0].id);
    return rootEmotion?.color || "#10B981";
  }, [selections]);

  const stepTitle = useMemo(() => {
    if (step === 'level1') return t(locale, 'steps.level1');
    if (step === 'level2') return t(locale, 'steps.level2', { emotion: t(locale, selections[0]?.labelKey) });
    if (step === 'level3') return t(locale, 'steps.level3');
    return "";
  }, [step, selections, locale]);

  // --- Render ---

  return (
    <Layout>
      <Header 
        onBack={handleBack} 
        showBack={step !== 'home'} 
        theme={theme} 
        onToggleTheme={toggleTheme}
        locale={locale}
        onToggleLocale={toggleLocale}
      />

      <main className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {step === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col justify-center text-center"
            >
              <div className="mb-12 relative">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full glass-panel text-blue-400 relative z-10">
                  <Navigation size={40} className="animate-pulse" />
                </div>
                {/* Decorative rings */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-blue-500/20 rounded-full animate-[spin_10s_linear_infinite]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border border-blue-500/10 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
              </div>
              
              <h1 className="text-2xl sm:text-4xl font-extralight mb-4 tracking-[0.2em] sm:tracking-[0.3em] text-white uppercase px-2 break-words">
                {t(locale, 'brand')}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mb-12 sm:mb-16 leading-relaxed tracking-[0.1em] sm:tracking-widest uppercase font-mono px-4">
                {t(locale, 'brandSub')}<br />
                <span className="opacity-50">{t(locale, 'brandTag')}</span>
              </p>
              
              <div className="space-y-4 sm:space-y-6 max-w-[320px] mx-auto w-full px-4 sm:px-0">
                <button
                  onClick={handleStart}
                  className="w-full py-4 sm:py-5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-2xl font-medium tracking-[0.2em] uppercase text-xs sm:text-sm transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] active:scale-[0.98]"
                >
                  {t(locale, 'home.start')}
                </button>
                
                <button
                  onClick={() => setStep('about')}
                  className="w-full py-4 text-slate-500 hover:text-slate-300 transition-colors uppercase text-[10px] tracking-[0.3em] flex items-center justify-center gap-2"
                >
                  <Info size={14} />
                  {t(locale, 'home.specs')}
                </button>
              </div>

              <div className="mt-20 flex flex-col items-center gap-4 opacity-30">
                <div className="w-px h-12 bg-gradient-to-b from-transparent via-blue-500 to-transparent" />
                <p className="text-[10px] uppercase tracking-[0.2em] font-mono">
                  {t(locale, 'home.sector')}
                </p>
              </div>
            </motion.div>
          )}

          {step === 'about' && (
            <motion.div
              key="about"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 pb-12"
            >
              <h2 className="text-xl font-light mb-8 text-white tracking-[0.2em] uppercase flex items-center gap-3">
                <Target size={20} className="text-blue-500" />
                {t(locale, 'about.title')}
              </h2>
              
              <div className="space-y-8">
                <section>
                  <h3 className="text-[10px] font-bold mb-4 text-blue-400 uppercase tracking-[0.3em] flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-blue-500" />
                    {t(locale, 'about.phase1Title')}
                  </h3>
                  <div className="glass-panel rounded-2xl p-6 space-y-4 text-slate-400 text-sm leading-relaxed font-light">
                    <p>
                      {t(locale, 'about.phase1Desc1')}
                    </p>
                    <p className="text-slate-200">
                      {t(locale, 'about.phase1Desc2')}
                    </p>
                  </div>
                </section>

                <section>
                  <h3 className="text-[10px] font-bold mb-4 text-blue-400 uppercase tracking-[0.3em] flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-blue-500" />
                    {t(locale, 'about.phase2Title')}
                  </h3>
                  <div className="glass-panel rounded-2xl p-6 space-y-4 text-slate-400 text-sm leading-relaxed font-light">
                    <p>
                      {t(locale, 'about.phase2Desc')}
                    </p>
                    <ul className="space-y-4">
                      <li className="flex gap-3">
                        <div className="w-1 h-1 rounded-full bg-blue-500/40 mt-1.5" />
                        <span>{t(locale, 'about.phase2Item1')}</span>
                      </li>
                      <li className="flex gap-3">
                        <div className="w-1 h-1 rounded-full bg-blue-500/40 mt-1.5" />
                        <span>{t(locale, 'about.phase2Item2')}</span>
                      </li>
                    </ul>
                  </div>
                </section>

                <section className="pt-4 border-t border-white/5">
                  <div className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/10">
                    <p className="text-[10px] text-slate-500 leading-relaxed font-light">
                      <strong className="text-blue-400/80 font-medium">{t(locale, 'about.disclaimerTitle')}</strong><br />
                      {t(locale, 'about.disclaimerDesc')}
                    </p>
                  </div>
                </section>
              </div>

              <button
                onClick={() => setStep('home')}
                className="w-full mt-12 py-4 glass-button text-slate-300 rounded-xl font-medium tracking-[0.2em] uppercase text-xs hover:text-white transition-all"
              >
                {t(locale, 'common.returnHome')}
              </button>
            </motion.div>
          )}

          {(step === 'level1' || step === 'level2' || step === 'level3') && (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="flex-1"
            >
              <div className="mb-10">
                <h2 className="text-xl font-light leading-snug text-white tracking-wide">
                  {stepTitle}
                </h2>
              </div>
              <div className="space-y-1">
                {currentOptions.map((node, index) => (
                  <EmotionButton
                    key={node.id}
                    label={t(locale, node.labelKey)}
                    onClick={() => handleSelect(node)}
                    delay={index * 0.05}
                  />
                ))}
              </div>
              
              {/* Decorative detail */}
              <div className="mt-12 pt-8 border-t border-white/5 flex justify-between items-center opacity-20">
                <div className="flex gap-4">
                  <div className="w-1 h-1 rounded-full bg-white" />
                  <div className="w-1 h-1 rounded-full bg-white" />
                  <div className="w-1 h-1 rounded-full bg-white" />
                </div>
              </div>
            </motion.div>
          )}

          {step === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex-1 flex flex-col"
            >
              <div className="flex-1 flex flex-col justify-center">
                <div 
                  className="glass-panel rounded-3xl p-6 sm:p-10 mb-8 relative overflow-hidden text-center border-blue-500/20"
                >
                  {/* Technical grid background */}
                  <div className="absolute inset-0 opacity-5 pointer-events-none">
                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-center gap-2 mb-8 text-[10px] font-mono uppercase tracking-[0.3em] text-blue-400/60">
                      {selections.map((s, i) => (
                        <React.Fragment key={s.id}>
                          <span>{t(locale, s.labelKey)}</span>
                          {i < selections.length - 1 && <MoveRight size={10} className="opacity-30" />}
                        </React.Fragment>
                      ))}
                    </div>

                    <p className="text-[10px] text-slate-500 mb-2 uppercase tracking-[0.2em] font-mono">{t(locale, 'result.identified')}</p>
                    <h3 
                      className="text-2xl sm:text-4xl font-bold tracking-wider text-white break-words w-full"
                    >
                      {resultSentence.includes(' (') ? (
                        <div className="flex flex-col items-center">
                          <span className="text-center">{resultSentence.split(' (')[0]}</span>
                          <span className="text-base sm:text-lg font-light text-slate-500 mt-2 sm:mt-3 tracking-widest uppercase font-mono text-center">
                            ({resultSentence.split(' (')[1]}
                          </span>
                        </div>
                      ) : (
                        <span className="text-center block">{resultSentence}</span>
                      )}
                    </h3>
                    
                    <div className="mt-10 flex justify-center gap-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="w-1 h-1 rounded-full bg-blue-500/40" />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-mono">{t(locale, 'result.nextProtocol')}</p>
                    <p className="text-xs text-slate-400 font-light leading-relaxed px-4">
                      {t(locale, 'result.helperText')}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setStep('reflection');
                      setReflectionSubStep(0);
                    }}
                    className="w-full py-5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-2xl font-medium tracking-[0.1em] text-sm transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] flex items-center justify-center gap-3"
                  >
                    <Target size={18} />
                    <span>{t(locale, 'result.cta')}</span>
                  </button>

                  <button
                    onClick={handleRestart}
                    className="w-full py-4 text-slate-500 hover:text-slate-300 transition-colors uppercase text-[10px] tracking-[0.3em] flex items-center justify-center gap-2"
                  >
                    <RotateCcw size={14} />
                    <span>{t(locale, 'common.restart')}</span>
                  </button>
                </div>
              </div>
              
              <footer className="mt-8 text-center opacity-20">
                <p className="text-[8px] uppercase tracking-[0.4em] font-mono">
                  {t(locale, 'result.status')}
                </p>
              </footer>
            </motion.div>
          )}
          {step === 'reflection' && (
            <motion.div
              key="reflection"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1"
            >
              <div className="mb-8 flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                <div className="text-[10px] uppercase tracking-[0.4em] text-blue-400/60 font-mono">
                  {t(locale, 'reflection.protocol')}
                </div>
              </div>

              {selections[2]?.reflectionMode === 'savor' ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-10"
                >
                  <h2 className="text-2xl font-light text-white leading-snug tracking-wide">
                    {t(locale, 'reflection.savorTitle', { emotion: t(locale, selections[2]?.labelKey) })}<br />
                    <span className="text-slate-400">{t(locale, 'reflection.savorSub')}</span>
                  </h2>
                  <div className="space-y-3">
                    {[
                      { id: 'savor_record', label: t(locale, 'reflection.savorOptions.record'), icon: PenLine },
                      { id: 'savor_insight', label: t(locale, 'reflection.savorOptions.insight'), icon: Lightbulb },
                      { id: 'savor_action', label: t(locale, 'reflection.savorOptions.action'), icon: Sun },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setReflectionPath(opt.id as ReflectionPath);
                          setStep('reflectionResult');
                        }}
                        className="w-full p-6 glass-button rounded-xl text-left flex items-center justify-between group"
                      >
                        <span className="text-slate-200 group-hover:text-white transition-colors">{opt.label}</span>
                        <opt.icon size={18} className="text-slate-600 group-hover:text-blue-400 transition-colors" />
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <>
                  {reflectionSubStep === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-10"
                    >
                      <h2 className="text-2xl font-light text-white leading-snug tracking-wide">
                        {t(locale, 'reflection.problemTitle', { emotion: t(locale, selections[2]?.labelKey) })}<br />
                        <span className="text-slate-400">{t(locale, 'reflection.problemSub')}</span>
                      </h2>
                      <div className="space-y-3">
                        {(t(locale, 'reflection.problemOptions') as string[]).map((label) => (
                          <button
                            key={label}
                            onClick={() => setReflectionSubStep(1)}
                            className="w-full p-6 glass-button rounded-xl text-left text-slate-300 hover:text-white transition-all"
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {reflectionSubStep === 1 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-10"
                    >
                      <h2 className="text-2xl font-light text-white leading-snug tracking-wide">
                        {t(locale, 'reflection.controlTitle')}<br />
                        <span className="text-slate-400">{t(locale, 'reflection.controlSub')}</span>
                      </h2>
                      <div className="space-y-3">
                        {[
                          { id: 'control', label: t(locale, 'reflection.controlOptions.control') },
                          { id: 'grey', label: t(locale, 'reflection.controlOptions.grey') },
                          { id: 'acceptance', label: t(locale, 'reflection.controlOptions.acceptance') },
                        ].map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => {
                              setReflectionPath(opt.id as ReflectionPath);
                              setStep('reflectionResult');
                            }}
                            className="w-full p-6 glass-button rounded-xl text-left text-slate-300 hover:text-white transition-all"
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {step === 'reflectionResult' && (
            <motion.div
              key="reflectionResult"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex-1 flex flex-col"
            >
              <div className="flex-1 flex flex-col justify-center">
                <div id="reflection-result-card" className="glass-panel rounded-3xl p-6 sm:p-8 mb-8 border-blue-500/20">
                  {reflectionPath === 'control' && (
                    <div className="space-y-6">
                      <div className="inline-flex p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                        <Check size={20} />
                      </div>
                      <h3 className="text-xl font-light text-white tracking-wide">{t(locale, 'reflectionResult.control.title')}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed font-light">
                        {t(locale, 'reflectionResult.control.desc')}
                      </p>
                      <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                        <p className="text-[10px] font-bold text-blue-400/60 uppercase tracking-widest mb-2 font-mono">{t(locale, 'reflectionResult.queryLabel')}</p>
                        <p className="text-slate-200 font-light italic">{t(locale, 'reflectionResult.control.query')}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-blue-400/60 uppercase tracking-widest mb-2 font-mono">{t(locale, 'reflectionResult.directiveLabel')}</p>
                        <p className="text-slate-300 text-sm">{t(locale, 'reflectionResult.control.directive')}</p>
                      </div>
                    </div>
                  )}

                  {reflectionPath === 'grey' && (
                    <div className="space-y-6">
                      <div className="inline-flex p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                        <RotateCcw size={20} />
                      </div>
                      <h3 className="text-xl font-light text-white tracking-wide">{t(locale, 'reflectionResult.grey.title')}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed font-light">
                        {t(locale, 'reflectionResult.grey.desc')}
                      </p>
                      <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                        <p className="text-[10px] font-bold text-amber-400/60 uppercase tracking-widest mb-2 font-mono">{t(locale, 'reflectionResult.queryLabel')}</p>
                        <p className="text-slate-200 font-light italic">{t(locale, 'reflectionResult.grey.query')}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-amber-400/60 uppercase tracking-widest mb-2 font-mono">{t(locale, 'reflectionResult.directiveLabel')}</p>
                        <p className="text-slate-300 text-sm">{t(locale, 'reflectionResult.grey.directive')}</p>
                      </div>
                    </div>
                  )}

                  {reflectionPath === 'acceptance' && (
                    <div className="space-y-6">
                      <div className="inline-flex p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                        <Heart size={20} />
                      </div>
                      <h3 className="text-xl font-light text-white tracking-wide">{t(locale, 'reflectionResult.acceptance.title')}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed font-light">
                        {t(locale, 'reflectionResult.acceptance.desc', { emotion: t(locale, selections[2]?.labelKey) })}
                      </p>
                      <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                        <p className="text-[10px] font-bold text-blue-400/60 uppercase tracking-widest mb-2 font-mono">{t(locale, 'reflectionResult.queryLabel')}</p>
                        <p className="text-slate-200 font-light italic">{t(locale, 'reflectionResult.acceptance.query')}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-blue-400/60 uppercase tracking-widest mb-2 font-mono">{t(locale, 'reflectionResult.directiveLabel')}</p>
                        <p className="text-slate-300 text-sm">{t(locale, 'reflectionResult.acceptance.directive')}</p>
                      </div>
                    </div>
                  )}

                  {reflectionPath === 'savor_record' && (
                    <div className="space-y-6">
                      <div className="inline-flex p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                        <PenLine size={20} />
                      </div>
                      <h3 className="text-xl font-light text-white tracking-wide">{t(locale, 'reflectionResult.savor_record.title')}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed font-light">
                        {t(locale, 'reflectionResult.savor_record.desc')}
                      </p>
                      <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                        <p className="text-[10px] font-bold text-blue-400/60 uppercase tracking-widest mb-2 font-mono">{t(locale, 'reflectionResult.queryLabel')}</p>
                        <p className="text-slate-200 font-light italic">{t(locale, 'reflectionResult.savor_record.query')}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-blue-400/60 uppercase tracking-widest mb-2 font-mono">{t(locale, 'reflectionResult.directiveLabel')}</p>
                        <p className="text-slate-300 text-sm">{t(locale, 'reflectionResult.savor_record.directive', { emotion: t(locale, selections[2]?.labelKey) })}</p>
                      </div>
                    </div>
                  )}

                  {reflectionPath === 'savor_insight' && (
                    <div className="space-y-6">
                      <div className="inline-flex p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                        <Lightbulb size={20} />
                      </div>
                      <h3 className="text-xl font-light text-white tracking-wide">{t(locale, 'reflectionResult.savor_insight.title')}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed font-light">
                        {t(locale, 'reflectionResult.savor_insight.desc')}
                      </p>
                      <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                        <p className="text-[10px] font-bold text-amber-400/60 uppercase tracking-widest mb-2 font-mono">{t(locale, 'reflectionResult.queryLabel')}</p>
                        <p className="text-slate-200 font-light italic">{t(locale, 'reflectionResult.savor_insight.query')}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-amber-400/60 uppercase tracking-widest mb-2 font-mono">{t(locale, 'reflectionResult.directiveLabel')}</p>
                        <p className="text-slate-300 text-sm">{t(locale, 'reflectionResult.savor_insight.directive')}</p>
                      </div>
                    </div>
                  )}

                  {reflectionPath === 'savor_action' && (
                    <div className="space-y-6">
                      <div className="inline-flex p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                        <Sun size={20} />
                      </div>
                      <h3 className="text-xl font-light text-white tracking-wide">{t(locale, 'reflectionResult.savor_action.title')}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed font-light">
                        {t(locale, 'reflectionResult.savor_action.desc')}
                      </p>
                      <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                        <p className="text-[10px] font-bold text-blue-400/60 uppercase tracking-widest mb-2 font-mono">{t(locale, 'reflectionResult.queryLabel')}</p>
                        <p className="text-slate-200 font-light italic">{t(locale, 'reflectionResult.savor_action.query')}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-blue-400/60 uppercase tracking-widest mb-2 font-mono">{t(locale, 'reflectionResult.directiveLabel')}</p>
                        <p className="text-slate-300 text-sm">{t(locale, 'reflectionResult.savor_action.directive', { emotion: t(locale, selections[2]?.labelKey) })}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={handleCopyResult}
                      className="py-4 glass-button rounded-xl text-slate-300 font-medium flex items-center justify-center gap-2 hover:text-white transition-all text-xs uppercase tracking-widest"
                    >
                      {copied ? (
                        <>
                          <Check size={14} className="text-blue-400" />
                          <span>{t(locale, 'common.copied')}</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span>{t(locale, 'common.copy')}</span>
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={handleDownloadImage}
                      className="py-4 glass-button rounded-xl text-slate-300 font-medium flex items-center justify-center gap-2 hover:text-white transition-all text-xs uppercase tracking-widest"
                    >
                      <Download size={14} />
                      <span>{t(locale, 'common.save')}</span>
                    </button>
                  </div>

                  <button
                    onClick={handleRestart}
                    className="w-full py-5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-2xl font-medium tracking-[0.2em] uppercase text-sm transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                  >
                    {t(locale, 'common.complete')}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </Layout>
  );
}
