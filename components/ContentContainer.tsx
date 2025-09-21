/* tslint:disable */
import Editor from '@monaco-editor/react';
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import {Tab, TabList, TabPanel, Tabs} from 'react-tabs';
import {parseHTML, parseJSON} from '@/lib/parse';
import { CHAT_PROMPT, CAPTIONS_FROM_VIDEO_PROMPT, CODE_REGION_CLOSER, CODE_REGION_OPENER, SPEC_ADDENDUM, SPEC_FROM_VIDEO_PROMPT, SUMMARY_FROM_VIDEO_PROMPT, TRANSCRIPT_FROM_VIDEO_PROMPT } from '@/lib/prompts';
import {generateText} from '@/lib/textGeneration';
import { Caption, ChatMessage } from '@/lib/types';
import { exampleComponents } from './examples';

type LoadingState = 'loading-summary' | 'loading-transcript' | 'loading-captions' | 'loading-spec' | 'loading-code' | 'ready' | 'error';
interface ErrorState { message: string; advice: string; }

interface ContentContainerProps {
  contentBasis: string;
  preSeededSummary?: string;
  preSeededSpec?: string;
  preSeededComponent?: string;
  preSeededTranscript?: string;
  preSeededCaptions?: Caption[];
  preSeededChatHistory?: ChatMessage[];
  onLoadingStateChange?: (isLoading: boolean) => void;
}
interface ContentContainerHandle {
  getSpec: () => string;
  getCode: () => string;
}

export default forwardRef<ContentContainerHandle, ContentContainerProps>(function ContentContainer({ contentBasis, preSeededSummary, preSeededSpec, preSeededComponent, preSeededTranscript, preSeededCaptions, preSeededChatHistory, onLoadingStateChange }, ref) {
  const [summary, setSummary] = useState(preSeededSummary || '');
  const [transcript, setTranscript] = useState(preSeededTranscript || '');
  const [captions, setCaptions] = useState<Caption[]>(preSeededCaptions || []);
  const [spec, setSpec] = useState(preSeededSpec || '');
  const [code, setCode] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(preSeededChatHistory || []);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [loadingState, setLoadingState] = useState<LoadingState>(preSeededComponent ? 'ready' : 'loading-summary');
  const [error, setError] = useState<ErrorState | null>(null);
  const [isEditingSpec, setIsEditingSpec] = useState(false);
  const [editedSpec, setEditedSpec] = useState('');
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [show3dPreview, setShow3dPreview] = useState(false);
  const [showVideoControls, setShowVideoControls] = useState(false);
  const [videoState, setVideoState] = useState({ isPlaying: false, progress: 0, volume: 1, duration: 0, currentTime: 0 });
  const [activeCaptionIndex, setActiveCaptionIndex] = useState(-1);
  const editorRef = useRef(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const captionRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => ({ getSpec: () => spec, getCode: () => code }));
  useEffect(() => { onLoadingStateChange?.(loadingState.startsWith('loading')); }, [loadingState, onLoadingStateChange]);

  const getErrorMessageAndAdvice = (msg: string): ErrorState => {
    const lowerMsg = msg.toLowerCase();
    if (lowerMsg.includes('json')) return { message: 'Invalid AI Response', advice: 'The AI returned a response in an unexpected format. This might be a temporary issue. Please try again.' };
    if (lowerMsg.includes('api key')) return { message: 'API Key Error', advice: 'Please ensure your API key is configured correctly and has the necessary permissions.' };
    if (lowerMsg.includes('blocked') || lowerMsg.includes('safety')) return { message: 'Content Generation Blocked', advice: 'The request was blocked due to safety concerns with the video content. Please try a different video.' };
    if (lowerMsg.includes('quota')) return { message: 'Quota Exceeded', advice: 'You have exceeded your API usage quota. Please check your account status and try again later.' };
    if (lowerMsg.includes('no candidates') || lowerMsg.includes('no content')) return { message: 'No Content Generated', advice: 'The AI was unable to generate a response from this video. The video might be too complex, have poor audio, or contain no clear educational content.' };
    if (lowerMsg.includes('invalid video') || lowerMsg.includes('unsupported format')) return { message: 'Invalid Video Format', advice: 'The video format is not supported. Please try a different YouTube video.' };
    if (lowerMsg.includes('timeout') || lowerMsg.includes('deadline exceeded')) return { message: 'Video Processing Timeout', advice: 'The video took too long to process. Please try a shorter video.' };
    if (lowerMsg.includes('failed to process') || lowerMsg.includes('could not process')) return { message: 'Video Could Not Be Processed', advice: 'We were unable to process this video. Please ensure it is a valid, public YouTube video and try again.' };
    if (lowerMsg.includes('network') || lowerMsg.includes('fetch')) return { message: 'Network Error', advice: 'Could not connect to the server. Please check your internet connection.' };
    return { message: 'An Unknown Error Occurred', advice: 'Something went wrong. Please try a different video or try again later.' };
  };

  useEffect(() => {
    const check3D = (t: string) => ['3d','cube','geometric','shape','geometry','polygon','mesh'].some(k=>t.toLowerCase().includes(k));
    async function run() {
      if (preSeededComponent) { 
        setSummary(preSeededSummary||''); setTranscript(preSeededTranscript||''); setCaptions(preSeededCaptions||[]); setSpec(preSeededSpec||''); setChatHistory(preSeededChatHistory||[]); setShow3dPreview(check3D(preSeededSpec||'')); setLoadingState('ready'); return; 
      }
      try {
        setLoadingState('loading-summary'); setError(null);
        // FIX: Use gemini-2.5-flash model
        const sumRes = await generateText({ modelName: 'gemini-2.5-flash', prompt: SUMMARY_FROM_VIDEO_PROMPT, videoUrl: contentBasis, temperature: 0.7 }); setSummary(parseJSON(sumRes).summary);
        setLoadingState('loading-transcript');
        // FIX: Use gemini-2.5-flash model
        const transRes = await generateText({ modelName: 'gemini-2.5-flash', prompt: TRANSCRIPT_FROM_VIDEO_PROMPT, videoUrl: contentBasis, temperature: 0.1 }); setTranscript(parseJSON(transRes).transcript);
        setLoadingState('loading-captions');
        // FIX: Use gemini-2.5-flash model
        const capRes = await generateText({ modelName: 'gemini-2.5-flash', prompt: CAPTIONS_FROM_VIDEO_PROMPT, videoUrl: contentBasis, temperature: 0.1 }); setCaptions(parseJSON(capRes).captions);
        setLoadingState('loading-spec');
        // FIX: Use gemini-2.5-flash model
        const specRes = await generateText({ modelName: 'gemini-2.5-flash', prompt: SPEC_FROM_VIDEO_PROMPT, videoUrl: contentBasis, temperature: 0.5 }); const newSpec = parseJSON(specRes).spec + SPEC_ADDENDUM;
        setSpec(newSpec); setShow3dPreview(check3D(newSpec));
        setLoadingState('loading-code');
        // FIX: Use gemini-2.5-flash model
        const codeRes = await generateText({ modelName: 'gemini-2.5-flash', prompt: newSpec, temperature: 0.2 }); setCode(parseHTML(codeRes, CODE_REGION_OPENER, CODE_REGION_CLOSER));
        setChatHistory([{ role: 'model', text: "Hello! I'm your AI tutor. Ask me anything about this app!" }]);
        setLoadingState('ready');
      } catch (err) { setError(getErrorMessageAndAdvice(err instanceof Error ? err.message : 'Unknown error')); setLoadingState('error'); }
    }
    run();
  }, [contentBasis, preSeededSummary, preSeededSpec, preSeededComponent, preSeededTranscript, preSeededCaptions, preSeededChatHistory]);
  
  useEffect(() => {
    if (captionRefs.current[activeCaptionIndex]) captionRefs.current[activeCaptionIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [activeCaptionIndex]);

  useEffect(() => {
    if (chatContainerRef.current) chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  }, [chatHistory, isAiTyping]);

  const handleSpecSave = async () => {
    if (editedSpec.trim() === spec) { setIsEditingSpec(false); return; }
    try {
      setLoadingState('loading-code'); setError(null); setSpec(editedSpec); setIsEditingSpec(false); setActiveTabIndex(preSeededComponent ? 0 : 1);
      setShow3dPreview(['3d','cube','geometric','shape'].some(k=>editedSpec.toLowerCase().includes(k)));
      // FIX: Use gemini-2.5-flash model
      const codeRes = await generateText({ modelName: 'gemini-2.5-flash', prompt: editedSpec, temperature: 0.2 });
      setCode(parseHTML(codeRes, CODE_REGION_OPENER, CODE_REGION_CLOSER));
      setLoadingState('ready');
    } catch (err) { setError(getErrorMessageAndAdvice(err instanceof Error ? err.message : 'Unknown error')); setLoadingState('error'); }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const input = form.elements.namedItem('chat-input') as HTMLInputElement;
    const userMessage = input.value.trim();
    if (!userMessage || isAiTyping) return;
    
    const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', text: userMessage }];
    setChatHistory(newHistory);
    setIsAiTyping(true);
    input.value = '';

    try {
      const context = `APP SUMMARY:\n${summary}\n\nVIDEO TRANSCRIPT:\n${transcript}\n\nAPP SPECIFICATION:\n${spec}\n\nAPP SOURCE CODE:\n${preSeededComponent ? "N/A (This is a pre-built example)" : code}`;
      const history = newHistory.map(m => `${m.role}: ${m.text}`).join('\n');
      const prompt = CHAT_PROMPT(context, history);
      // FIX: Use gemini-2.5-flash model
      const aiResponse = await generateText({ modelName: 'gemini-2.5-flash', prompt, temperature: 0.7 });
      setChatHistory(prev => [...prev, { role: 'model', text: aiResponse }]);
    } catch (err) {
      const errorDetails = getErrorMessageAndAdvice(err instanceof Error ? err.message : 'Unknown error');
      setChatHistory(prev => [...prev, { role: 'model', text: `Sorry, I encountered an error: ${errorDetails.message}. Please try again.` }]);
    } finally {
      setIsAiTyping(false);
    }
  };

  const setupVideoListeners = () => {
    const v = iframeRef.current?.contentWindow?.document.querySelector('video'); videoRef.current = v || null; setShowVideoControls(!!v);
    if (v) { const u = () => {
      const time = v.currentTime;
      setVideoState({isPlaying:!v.paused,progress:time/v.duration,volume:v.volume,duration:v.duration||0,currentTime:time||0});
      const capIdx = captions.findIndex(c => time >= c.startTime && time <= c.endTime);
      setActiveCaptionIndex(capIdx);
    }; ['play','pause','timeupdate','volumechange','loadedmetadata'].forEach(e=>v.addEventListener(e,u)); u(); }
  };
  const formatTime = (t: number) => { if (isNaN(t) || t === 0) return '0:00'; const m = Math.floor(t/60); const s = Math.floor(t%60).toString().padStart(2,'0'); return `${m}:${s}`; };
  const renderVideoControls = () => {
    const progressPercent = (videoState.progress || 0) * 100;
    const seekBarBackground = `linear-gradient(to right, var(--color-accent) ${progressPercent}%, rgba(255, 255, 255, 0.3) ${progressPercent}%)`;
    return (<div className={`video-controls ${showVideoControls ? 'visible' : ''}`}><button onClick={() => videoRef.current?.paused ? videoRef.current?.play() : videoRef.current?.pause()} className="control-button"><span className="material-symbols-rounded">{videoState.isPlaying ? 'pause' : 'play_arrow'}</span></button><div className="time-display">{formatTime(videoState.currentTime)}</div><input type="range" min="0" max="1" step="0.01" value={videoState.progress || 0} onChange={(e) => { if(videoRef.current) videoRef.current.currentTime = +e.target.value * videoState.duration }} className="seek-bar" style={{ background: seekBarBackground }}/><div className="time-display">{formatTime(videoState.duration)}</div><div className="volume-control"><span className="material-symbols-rounded">volume_up</span><input type="range" min="0" max="1" step="0.05" value={videoState.volume} onChange={(e) => {if(videoRef.current) videoRef.current.volume = +e.target.value}} className="volume-slider"/></div></div>);
  };
  
  const ExampleComponent = preSeededComponent ? exampleComponents[preSeededComponent] : null;

  return (<div className="content-container-wrapper">{summary && <div className="summary-section"><h3>Video Summary</h3><p>{summary}</p></div>}<div className="main-content-area"><div className={`loading-container ${loadingState.startsWith('loading') ? 'active' : ''}`}><div className="bouncing-dots-loader"><div className="dot"></div><div className="dot"></div><div className="dot"></div></div><p className="loading-text">{loadingState === 'loading-summary' ? 'Generating summary...' : loadingState === 'loading-transcript' ? 'Generating transcript...' : loadingState === 'loading-captions' ? 'Generating captions...' : loadingState === 'loading-spec' ? 'Generating spec...' : 'Generating code...'}</p></div><div className={`error-container ${loadingState === 'error' ? 'active' : ''}`}><div className="error-icon"><span className="material-symbols-rounded">error</span></div><h3>Generation Failed</h3><p className="error-message-text">{error?.message}</p>{error?.advice && <p className="error-advice">{error.advice}</p>}</div><Tabs className={`tabs-container ${loadingState === 'ready' ? 'active' : ''}`} selectedIndex={activeTabIndex} onSelect={i => { if (isEditingSpec && i !== (preSeededComponent ? 3 : 4)) setIsEditingSpec(false); setActiveTabIndex(i); }}><TabList className="yt-tab-list"><Tab className="yt-tab" selectedClassName="yt-tab-selected">Render</Tab><Tab className="yt-tab" selectedClassName="yt-tab-selected">Chat</Tab>{!preSeededComponent && <Tab className="yt-tab" selectedClassName="yt-tab-selected">Code</Tab>}<Tab className="yt-tab" selectedClassName="yt-tab-selected">Captions</Tab><Tab className="yt-tab" selectedClassName="yt-tab-selected">Spec</Tab><Tab className="yt-tab" selectedClassName="yt-tab-selected">Transcript</Tab>{show3dPreview && <Tab className="yt-tab" selectedClassName="yt-tab-selected">3D Preview</Tab>}</TabList><div className="tab-panels-container"><TabPanel className="yt-tab-panel">{ExampleComponent ? <div className="component-render-container"><ExampleComponent /></div> : <div style={{height:'100%',width:'100%',position:'relative'}} onMouseEnter={() => videoRef.current && setShowVideoControls(true)} onMouseLeave={() => setShowVideoControls(false)}><iframe ref={iframeRef} key={Date.now()} srcDoc={code} onLoad={setupVideoListeners} style={{border:'none',width:'100%',height:'100%'}} title="rendered-html" sandbox="allow-scripts" />{videoRef.current && renderVideoControls()}</div>}</TabPanel><TabPanel className="yt-tab-panel chat-panel"><div className="chat-messages" ref={chatContainerRef}>{chatHistory.map((msg, i) => (<div key={i} className={`chat-message ${msg.role}`}><p>{msg.text}</p></div>))}{isAiTyping && <div className="chat-message model"><div className="typing-indicator"><span></span><span></span><span></span></div></div>}</div><form className="chat-input-form" onSubmit={handleChatSubmit}><input name="chat-input" type="text" placeholder="Ask a question about this app..." disabled={isAiTyping} /><button type="submit" disabled={isAiTyping}><span className="material-symbols-rounded">send</span></button></form></TabPanel>{!preSeededComponent && <TabPanel className="yt-tab-panel"><div style={{height:'100%',position:'relative',display:'flex',flexDirection:'column'}}><div className="editor-toolbar"><button onClick={() => editorRef.current?.getAction('editor.action.formatDocument').run()} className="button-secondary format-button">Format Code</button></div><div style={{flex:1,overflow:'hidden'}}><Editor height="100%" defaultLanguage="html" value={code} onChange={(v) => setCode(v || '')} onMount={(editor) => editorRef.current = editor} theme={document.body.classList.contains('dark') ? 'vs-dark' : 'light'} options={{minimap:{enabled:false},fontSize:14,wordWrap:'on',formatOnPaste:true,formatOnType:true}} /></div></div></TabPanel>}<TabPanel className="yt-tab-panel captions-panel"><div className="captions-text">{captions.map((cap, i) => (<span key={i} ref={el => { captionRefs.current[i] = el; } } className={`caption-word ${i === activeCaptionIndex ? 'active' : ''}`} onClick={() => { if(videoRef.current) videoRef.current.currentTime = cap.startTime; }}>{cap.word} </span>))}</div></TabPanel><TabPanel className="yt-tab-panel spec-panel">{isEditingSpec ? <div className="spec-editor-container"><Editor height="100%" defaultLanguage="text" value={editedSpec} onChange={v => setEditedSpec(v || '')} theme="light" options={{minimap:{enabled:false},fontSize:14,wordWrap:'on',lineNumbers:'off'}} /><div className="spec-button-container"><button onClick={handleSpecSave} className="button-primary">Save & regenerate</button><button onClick={() => setIsEditingSpec(false)} className="button-secondary">Cancel</button></div></div> : <div className="spec-viewer-container"><div className="spec-text">{spec}</div><div className="spec-button-container"><button onClick={() => { setEditedSpec(spec); setIsEditingSpec(true); }} className="button-secondary">Edit Spec<span className="material-symbols-rounded">edit</span></button></div></div>}</TabPanel><TabPanel className="yt-tab-panel transcript-panel"><div className="transcript-text">{transcript}</div></TabPanel>{show3dPreview && <TabPanel className="yt-tab-panel"><div className="cube-container"><div className="cube-scene"><div className="cube"><div className="cube-face cube-face-front"></div><div className="cube-face cube-face-back"></div><div className="cube-face cube-face-right"></div><div className="cube-face cube-face-left"></div><div className="cube-face cube-face-top"></div><div className="cube-face cube-face-bottom"></div></div></div><p className="cube-caption">Interactive 3D Preview</p></div></TabPanel>}</div></Tabs></div><style>{`.content-container-wrapper{border:var(--border-width-sm) solid var(--color-border-secondary);border-radius:var(--border-radius-md);box-sizing:border-box;display:flex;flex-direction:column;height:100%;max-height:inherit;min-height:inherit;overflow:hidden;position:relative;background-color:var(--color-background)}.summary-section{padding:var(--space-md) var(--space-lg);border-bottom:var(--border-width-sm) solid var(--color-border-secondary);text-align:center}.summary-section h3{font-family:var(--font-secondary);font-size:1.1rem;font-weight:500;margin-bottom:var(--space-sm)}.summary-section p{line-height:1.5;color:var(--color-text-secondary)}.main-content-area{flex:1;position:relative;overflow:hidden}.main-content-area > *{position:absolute;top:0;left:0;right:0;bottom:0;opacity:0;transform:translateY(1rem);transition:opacity .4s ease-out,transform .4s ease-out;pointer-events:none;display:flex;flex-direction:column}.main-content-area > .active{opacity:1;transform:translateY(0);pointer-events:auto}.main-content-area > .tabs-container{display:flex}.loading-container,.error-container{align-items:center;justify-content:center;text-align:center}.error-container{color:var(--color-error);padding:var(--space-md);text-align:center;box-sizing:border-box}.error-icon .material-symbols-rounded{font-size:5rem}.error-container h3{font-size:1.5rem;margin-top:var(--space-sm);margin-bottom:var(--space-sm)}.error-message-text,.error-advice{max-width:80%}.error-advice{margin-top:var(--space-md);font-style:italic;opacity:.8}.tabs-container{position:absolute;top:0;left:0;right:0;bottom:0;display:flex;flex-direction:column;height:100%}.yt-tab-list{list-style:none;padding:0 var(--space-md);margin:0;display:flex;border-bottom:var(--border-width-sm) solid var(--color-border-secondary)}.yt-tab{padding:var(--space-md) var(--space-sm);margin-right:var(--space-lg);cursor:pointer;font-size:.9rem;font-weight:500;color:var(--color-text-secondary);position:relative;border:none;background:0 0}.yt-tab:hover{color:var(--color-text-primary)}.yt-tab-selected{color:var(--color-text-primary);border-bottom:var(--border-width-sm) solid var(--color-text-primary);margin-bottom:calc(-1 * var(--border-width-sm))}.tab-panels-container{flex:1;overflow:hidden;position:relative}.yt-tab-panel{height:100%;width:100%;position:absolute;top:0;left:0;padding:0;display:none}.react-tabs__tab-panel--selected{display:block}.spec-panel,.transcript-panel,.captions-panel{padding:var(--space-md);overflow:auto;box-sizing:border-box}.component-render-container{width:100%;height:100%;overflow:auto;padding:var(--space-lg);box-sizing:border-box}.transcript-text{white-space:pre-wrap;font-family:var(--font-secondary);line-height:1.75;padding:var(--space-md) var(--space-xl);color:var(--color-text-secondary)}.captions-text{line-height:2;font-family:var(--font-secondary);font-size:1.1rem;padding:var(--space-md) var(--space-xl)}.caption-word{cursor:pointer;transition:background-color .2s, color .2s;border-radius:var(--border-radius-sm);padding:0.1em 0.2em}.caption-word.active{background-color:var(--color-accent);color:var(--color-text-on-accent)}.caption-word:hover{background-color:var(--color-surface-1-active)}.editor-toolbar{padding:var(--space-sm);background-color:var(--color-surface-2);display:flex;justify-content:flex-end;border-bottom:var(--border-width-sm) solid var(--color-border-secondary)}.format-button{border-radius:var(--border-radius-sm);padding:var(--space-xs) var(--space-sm);font-size:0.85rem}.video-controls{position:absolute;bottom:0;left:0;right:0;background-color:var(--color-overlay-dark);display:flex;align-items:center;padding:var(--space-sm);opacity:0;visibility:hidden;transition:opacity .3s,visibility .3s;z-index:10}.video-controls.visible{opacity:1;visibility:visible}.control-button{background:0 0;border:none;color:var(--color-text-inverted);cursor:pointer;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center}.control-button:hover{background-color:rgba(255,255,255,0.2)}.control-button .material-symbols-rounded{font-size:24px}.seek-bar{flex:1;margin:0 var(--space-sm);-webkit-appearance:none;appearance:none;height:5px;background:rgba(255,255,255,.3);border-radius:5px;outline:none}.seek-bar::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:15px;height:15px;background:var(--color-accent);border-radius:50%;cursor:pointer}.time-display{color:var(--color-text-inverted);font-size:.8rem;min-width:40px;text-align:center}.volume-control{display:flex;align-items:center}.volume-slider{-webkit-appearance:none;appearance:none;width:70px;height:4px;background:rgba(255,255,255,.5);border-radius:2px;outline:none}.volume-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:12px;height:12px;background:var(--color-text-inverted);border-radius:50%;cursor:pointer}.spec-viewer-container,.spec-editor-container{height:100%;display:flex;flex-direction:column}.spec-text{white-space:pre-wrap;font-family:var(--font-technical);line-height:1.75;flex:1;overflow:auto;padding:var(--space-md) var(--space-xl);mask-image:linear-gradient(to bottom,black 95%,transparent 100%);-webkit-mask-image:linear-gradient(to bottom,black 95%,transparent 100%)}.spec-button-container{padding:var(--space-md) var(--space-xl) 0;display:flex;gap:var(--space-sm)}.spec-button-container .material-symbols-rounded{font-size:16px;vertical-align:text-bottom;margin-left:var(--space-xs)}@keyframes pulse{0%,100%{opacity:.7}50%{opacity:1}}.loading-text{color:var(--color-text-secondary);font-size:1.125rem;margin-top:var(--space-lg);animation:pulse 2s cubic-bezier(.4,0,.6,1) infinite}.bouncing-dots-loader{display:flex;justify-content:center;gap:var(--space-sm)}.bouncing-dots-loader .dot{width:16px;height:16px;border-radius:50%;background-color:var(--color-accent);animation:bounce 1.4s infinite ease-in-out both}.bouncing-dots-loader .dot:nth-child(1){animation-delay:-.32s}.bouncing-dots-loader .dot:nth-child(2){animation-delay:-.16s}@keyframes bounce{0%,80%,100%{transform:translateY(0) scale(.8);opacity:.5}40%{transform:translateY(-20px) scale(1);opacity:1}}.cube-container{width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;background-color:var(--color-surface-2);overflow:hidden}.cube-scene{width:200px;height:200px;perspective:600px}.cube{width:100%;height:100%;position:relative;transform-style:preserve-3d;animation:rotate-cube 12s infinite linear}.cube-scene:hover .cube{animation-play-state:paused}.cube-face{position:absolute;width:200px;height:200px;border:var(--border-width-sm) solid var(--color-accent);background:rgba(var(--color-accent-rgb),.2)}.cube-face-front{transform:rotateY(0) translateZ(100px)}.cube-face-back{transform:rotateY(180deg) translateZ(100px)}.cube-face-right{transform:rotateY(90deg) translateZ(100px)}.cube-face-left{transform:rotateY(-90deg) translateZ(100px)}.cube-face-top{transform:rotateX(90deg) translateZ(100px)}.cube-face-bottom{transform:rotateX(-90deg) translateZ(100px)}.cube-caption{margin-top:var(--space-lg);color:var(--color-text-secondary);font-style:italic}@keyframes rotate-cube{from{transform:rotateX(0) rotateY(0)}to{transform:rotateX(360deg) rotateY(360deg)}}.chat-panel{display:flex;flex-direction:column;padding:0}.chat-messages{flex:1;overflow-y:auto;padding:var(--space-md)}.chat-message{display:flex;margin-bottom:var(--space-md);max-width:85%}.chat-message p{padding:var(--space-sm) var(--space-md);border-radius:var(--border-radius-md);line-height:1.6}.chat-message.user{align-self:flex-end;flex-direction:row-reverse}.chat-message.user p{background-color:var(--color-accent);color:var(--color-text-on-accent)}.chat-message.model{align-self:flex-start}.chat-message.model p{background-color:var(--color-surface-1);color:var(--color-text-primary)}.chat-input-form{display:flex;padding:var(--space-md);border-top:var(--border-width-sm) solid var(--color-border-secondary);background-color:var(--color-surface-2)}.chat-input-form input{flex:1;border-right:none;border-top-right-radius:0;border-bottom-right-radius:0}.chat-input-form button{border-top-left-radius:0;border-bottom-left-radius:0;background-color:var(--color-accent);color:var(--color-text-on-accent);padding:0 var(--space-md);display:flex;align-items:center;justify-content:center}.chat-input-form button:disabled{background-color:var(--color-surface-1-disabled);color:var(--color-text-disabled)}.typing-indicator span{height:8px;width:8px;border-radius:50%;background-color:var(--color-text-secondary);display:inline-block;animation:typing 1s infinite ease-in-out}.typing-indicator span:nth-child(2){animation-delay:.2s}.typing-indicator span:nth-child(3){animation-delay:.4s}@keyframes typing{0%,100%{opacity:.2}50%{opacity:1}}`}</style></div>);
});