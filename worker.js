// ==========================================
// 1. 前端 HTML 界面与拖拉拽系统 (Part 1 - 包含全页面通用左靠齐 LED 时钟、暂停开关、定时选择与一键测试)
// ==========================================
const FRONTEND_HTML_P1 = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>EPlayerX | 数据总控中枢</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>tailwind.config = { darkMode: 'class' }</script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Inter:wght@400;500;700;900&display=swap');
        body { font-family: 'Inter', sans-serif; -webkit-tap-highlight-color: transparent; }
        .font-mono-led { font-family: 'Share Tech Mono', monospace; }
        .fade-in { animation: fadeIn 0.4s ease-out; } 
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translate(-50%, -20px); } to { opacity: 1; transform: translate(-50%, 0); } }
        .hide-scrollbar::-webkit-scrollbar { display: none; } 
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .glass-panel { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); }
        .dark .glass-panel { background: rgba(24, 24, 27, 0.7); }
        
        .led-active {
            color: #10b981 !important;
            border-color: rgba(16, 185, 129, 0.4) !important;
            text-shadow: 0 0 8px rgba(16, 185, 129, 0.35);
            box-shadow: inset 0 0 10px rgba(16, 185, 129, 0.08), 0 0 15px rgba(16, 185, 129, 0.12);
        }
        .led-paused {
            color: #f59e0b !important;
            border-color: rgba(245, 158, 11, 0.5) !important;
            text-shadow: 0 0 8px rgba(245, 158, 11, 0.4);
            box-shadow: inset 0 0 10px rgba(245, 158, 11, 0.08), 0 0 15px rgba(245, 158, 11, 0.12);
        }
        @keyframes pulseDot { 0%, 100% { opacity: 1; } 50% { opacity: 0.2; } }
        .led-blink { animation: pulseDot 1s infinite; }

        .bg-checker {
            background-color: #f0f0f0;
            background-image: 
                linear-gradient(45deg, #ccc 25%, transparent 25%),
                linear-gradient(-45deg, #ccc 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, #ccc 75%),
                linear-gradient(-45deg, transparent 75%, #ccc 75%);
            background-size: 16px 16px;
            background-position: 0 0, 0 8px, 8px -8px, -8px 0px;
        }
        .dark .bg-checker {
            background-color: #1a1a1a;
            background-image: 
                linear-gradient(45deg, #2a2a2a 25%, transparent 25%),
                linear-gradient(-45deg, #2a2a2a 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, #2a2a2a 75%),
                linear-gradient(-45deg, transparent 75%, #2a2a2a 75%);
        }
    </style>
</head>
<body class="flex items-center justify-center h-screen overflow-hidden text-gray-800 transition-colors duration-300 relative bg-[#eaeef2] dark:bg-zinc-950">

    <!-- 极简管理登录 -->
    <div id="login-overlay" class="fixed inset-0 z-[999] bg-[#eaeef2] dark:bg-zinc-950 flex items-center justify-center transition-opacity duration-500">
        <div class="bg-white/70 dark:bg-zinc-900/80 backdrop-blur-3xl rounded-[2.5rem] p-8 md:p-10 w-11/12 max-w-sm shadow-2xl border border-white/50 dark:border-zinc-800/50 flex flex-col items-center transform transition-all fade-in">
            <div class="w-16 h-16 bg-gradient-to-br from-[#ff6b4a] to-[#ff4a2b] rounded-full flex items-center justify-center shadow-lg shadow-orange-500/40 mb-6">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            </div>
            <h2 class="text-3xl font-black text-gray-900 dark:text-white mb-8 tracking-tight">管理登录</h2>
            <input type="password" id="login-pwd" class="w-full px-5 py-4 bg-gray-100 dark:bg-zinc-800 border-2 border-transparent focus:border-[#ff6b4a] rounded-xl outline-none text-gray-900 dark:text-white mb-6 transition-colors font-bold tracking-widest text-center" placeholder="请输入密码..." onkeydown="if(event.key === 'Enter') doLogin()">
            <button onclick="doLogin()" class="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-[#ff6b4a] to-[#e53a1a] shadow-[0_5px_15px_rgba(255,107,74,0.3)] hover:scale-105 transition-transform">进入</button>
        </div>
    </div>

    <!-- 背景特效 -->
    <div class="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div class="absolute top-[-10%] left-[-10%] w-[30rem] md:w-[40rem] h-[30rem] md:h-[40rem] bg-[#ff6b4a]/20 dark:bg-[#ff6b4a]/10 rounded-full blur-[80px] md:blur-[100px]"></div>
        <div class="absolute bottom-[-10%] right-[-10%] w-[40rem] md:w-[50rem] h-[40rem] md:h-[50rem] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-[100px] md:blur-[120px]"></div>
    </div>

    <!-- 主控台面板 -->
    <div id="dashboard-box" class="w-full h-full p-0 lg:p-6 fade-in flex gap-6 box-border max-w-[1600px] mx-auto z-10 hidden">
        <div class="w-[280px] bg-[#27272a]/95 backdrop-blur-3xl rounded-[2.5rem] flex-col p-6 shadow-2xl border border-white/5 relative overflow-hidden hidden lg:flex shrink-0">
            <div class="text-white font-black text-2xl mb-8 flex items-center gap-3 mt-2 px-2 tracking-tighter">
                <div class="w-10 h-10 bg-gradient-to-br from-[#ff6b4a] to-[#ff4a2b] rounded-full flex items-center justify-center shadow-lg shadow-orange-500/40 shrink-0">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <div>EPlayer<span class="text-[#ff6b4a]">X.</span></div>
            </div>
            <div class="mb-4 px-3 py-1.5 rounded-lg text-xs font-bold text-center w-full border border-orange-500/30 text-orange-400 bg-orange-500/10">👑 管理员控制台</div>
            <nav class="flex flex-col gap-1.5 flex-1 overflow-y-auto pr-2 hide-scrollbar" id="pc-nav"></nav>
        </div>
        
        <div class="flex-1 glass-panel lg:rounded-[2.5rem] rounded-none shadow-xl flex flex-col p-4 md:p-6 lg:p-8 overflow-hidden relative border-0 lg:border border-white/60 dark:border-zinc-800/60 transition-colors duration-300 w-full h-full">
            <div class="overflow-y-auto h-full pr-1 md:pr-2 pb-[80px] lg:pb-8 hide-scrollbar">
                
                <!-- 顶部控制栏 -->
                <div class="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-4 gap-4">
                    <div>
                        <h1 id="cat-title" class="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white tracking-tighter leading-tight mb-2">大盘数据中心</h1>
                        <p class="text-gray-500 dark:text-gray-400 font-medium text-xs md:text-sm tracking-wide">独立获取最新片源数据，或定向对勾选的影片提取优质图/标。</p>
                    </div>
                    <div class="w-full xl:w-auto bg-white/40 dark:bg-zinc-800/40 backdrop-blur-md rounded-2xl md:rounded-[1.5rem] p-3 flex justify-between items-center gap-2 md:gap-3 border border-white/50 dark:border-zinc-700/50 shadow-sm self-start xl:self-end overflow-x-auto hide-scrollbar">
                         <div class="flex gap-2 w-full xl:w-auto items-center">
                             <button onclick="openConfirmModal('tg-webhook')" title="绑定Telegram机器人" class="w-10 h-10 md:w-12 md:h-12 shrink-0 bg-[#0088cc] text-white rounded-xl md:rounded-[1rem] flex items-center justify-center shadow-md transition-all hover:scale-105 active:scale-95 border border-white/20">
                                 <svg class="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0zm5.58 8.68l-1.92 9.07c-.14.64-.52.8-1.06.49l-2.92-2.15-1.41 1.35c-.16.16-.29.29-.59.29l.21-3 5.46-4.93c.24-.21-.05-.33-.37-.11l-6.75 4.24-2.9-.9c-.64-.2-.64-.64.13-.9l11.35-4.38c.53-.2 1.01.12.83.92z"/></svg>
                             </button>
                             <button id="extract-btn" onclick="batchForceLogos()" title="对勾选的数据进行深度脱水强制提取最优Logo和剧照！" class="px-2 md:px-3 h-10 md:h-12 shrink-0 bg-purple-600 text-white font-bold rounded-xl md:rounded-[1rem] text-xs md:text-sm shadow-md transition-all hover:scale-105 active:scale-95 border border-white/20 whitespace-nowrap">
                                🎯 提取图/标
                             </button>
                             <button onclick="openLayoutModal()" class="px-3 md:px-4 h-10 md:h-12 bg-emerald-500 text-white font-bold rounded-xl md:rounded-[1rem] text-xs md:text-sm shadow-md transition-all hover:scale-105 active:scale-95 border border-white/20 whitespace-nowrap">
                                🎨 排版与智能同步
                             </button>
                             <button id="batch-btn" onclick="openBatchModal()" class="flex-1 md:flex-none px-4 md:px-6 h-10 md:h-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl md:rounded-[1rem] text-xs md:text-sm shadow-md transition-all hover:scale-105 active:scale-95 border border-white/20 whitespace-nowrap">
                                📦 批量同步
                             </button>
                             <button id="sync-btn" onclick="openConfirmModal('sync-single')" title="极速抓取当前分类的最新片单" class="px-3 md:px-4 h-10 md:h-12 bg-gradient-to-b from-[#ff6b4a] to-[#e53a1a] text-white font-bold rounded-xl md:rounded-[1rem] text-xs md:text-sm shadow-md transition-all hover:scale-105 active:scale-95 border border-white/20 whitespace-nowrap">
                                ⚡ 同步最新数据
                             </button>
                             <button onclick="doLogout()" title="安全退出系统" class="w-10 h-10 md:w-12 md:h-12 shrink-0 bg-white dark:bg-zinc-800 text-red-500 rounded-xl md:rounded-[1rem] flex items-center justify-center shadow-md transition-all hover:scale-105 active:scale-95 border border-white/20 hover:bg-red-50 dark:hover:bg-red-900/30">
                                 <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                             </button>
                         </div>
                    </div>
                </div>

                <!-- 🌟 第一行：周更合集专属状态栏 (周更时显示：左边LED表 + 右边周历；普通分类时整行收起) -->
                <div id="status-bar-container" class="flex flex-col xl:flex-row items-center justify-between gap-3 w-full mb-6 shrink-0">
                    <!-- 周更模式下：LED 电子表插槽 (增加 min-w-0 保证伸缩) -->
                    <div id="led-slot-weekly" class="w-full xl:w-auto shrink-0 min-w-0">
                        <div id="led-monitor-box" class="w-full h-full flex items-center justify-between gap-3 px-3.5 md:px-5 py-2.5 rounded-2xl border font-mono-led select-none transition-all duration-300 bg-[#090d16] border-slate-800 text-slate-400 shadow-inner overflow-x-auto hide-scrollbar whitespace-nowrap cursor-grab active:cursor-grabbing">
                            <!-- 左侧：状态灯 + 文字（设为 shrink-0 绝不被压缩隐藏） -->
                            <div class="flex items-center gap-2 shrink-0">
                                <span id="led-dot" class="w-2.5 h-2.5 rounded-full bg-slate-600 shrink-0"></span>
                                <span id="led-tag" class="font-black px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 shrink-0">IDLE</span>
                                <span id="led-info" class="font-bold text-xs md:text-sm text-slate-200 shrink-0 flex items-center">大盘待命中</span>
                            </div>
                            
                            <!-- 右侧：三个控件统一高度 h-7 (28px)，100% 绝对齐平 -->
                            <div class="flex items-center gap-2 shrink-0 pl-2.5 border-l border-slate-800/80">
                                <!-- 1. 定时选择框 (h-7) -->
                                <div class="h-7 px-2 bg-slate-900 border border-slate-700/80 rounded-lg flex items-center gap-1 shrink-0 text-xs text-slate-300 shadow-sm box-border" title="设定每日自动全量同步时间">
                                    <span class="text-slate-400 font-bold text-[11px] leading-none">⏰</span>
                                    <select id="cron-hour-select" onchange="changeAutoStartTime(this.value)" class="bg-transparent text-emerald-400 font-bold outline-none cursor-pointer text-xs h-full leading-none">
                                        <option value="0">00:00</option><option value="1">01:00</option><option value="2">02:00</option>
                                        <option value="3" selected>03:00</option><option value="4">04:00</option><option value="5">05:00</option>
                                        <option value="6">06:00</option><option value="7">07:00</option><option value="8">08:00</option>
                                        <option value="9">09:00</option><option value="10">10:00</option><option value="11">11:00</option>
                                        <option value="12">12:00</option><option value="13">13:00</option><option value="14">14:00</option>
                                        <option value="15">15:00</option><option value="16">16:00</option><option value="17">17:00</option>
                                        <option value="18">18:00</option><option value="19">19:00</option><option value="20">20:00</option>
                                        <option value="21">21:00</option><option value="22">22:00</option><option value="23">23:00</option>
                                    </select>
                                </div>

                                <!-- 2. 立即测 按钮 (h-7 基准高度) -->
                                <button onclick="triggerCronNow()" id="cron-test-btn" class="h-7 px-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm shrink-0 flex items-center justify-center active:scale-95 leading-none" title="立即启动全量同步测试">🚀 立即测</button>

                                <!-- 3. 暂停 按钮 (h-7 齐平高度) -->
                                <button onclick="toggleCronPause()" id="cron-pause-btn" class="h-7 px-2.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 rounded-lg text-xs font-bold transition-all border border-slate-700 shrink-0 flex items-center justify-center leading-none" title="暂停/恢复轮询">⏸ 暂停</button>
                                
                                <!-- 时钟 (h-7 居中齐平) -->
                                <span id="led-clock" class="h-7 flex items-center font-bold text-xs tracking-wider text-slate-300 shrink-0 px-1 leading-none">--:--:--</span>
                            </div>
                        </div>
                    </div>

                    <!-- 周日~周六卡片 (仅周更分类激活) -->
                    <div id="weekday-tabs-container" class="hidden flex-1 justify-center items-center w-full">
                        <div id="weekday-buttons" class="flex bg-white/50 dark:bg-zinc-800/50 p-1.5 rounded-2xl border border-white/60 dark:border-zinc-700/60 shadow-inner justify-between gap-1 w-full max-w-xl"></div>
                    </div>
                </div>

                <!-- 🌟 第二行：核心控制栏 (合集按键全部统一高度 h-[88px]，右侧按钮精简为 默认/最新/热度) -->
                <div class="flex flex-col xl:flex-row w-full mb-8 gap-2.5 md:gap-3 justify-end items-center relative">
                    
                    <!-- 普通分类时：LED 实时电子表插槽 (自适应撑满左侧，与右侧 88px 按键无缝贴合) -->
                    <div id="led-slot-normal" class="hidden flex-1 min-w-0 w-full h-[44px] shrink-0 xl:shrink"></div>

                    <!-- 周更分类时：追更排期强制干预 (锁定 h-[88px]，靠左) -->
                    <div id="custom-override-container" class="hidden mr-auto w-full xl:w-auto h-[88px] bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md rounded-2xl px-5 md:px-6 shadow-sm border border-white dark:border-zinc-700/50 flex flex-col justify-center items-start transition-all duration-200 origin-left hover:-translate-y-0.5 hover:shadow-md cursor-pointer group hover:border-purple-300 dark:hover:border-purple-700/50 ml-1 shrink-0" onclick="openOverrideModal()">
                        <div class="flex items-center gap-2 mb-1.5">
                            <div class="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0 group-hover:scale-105 transition-transform">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                            </div>
                            <span class="text-xs md:text-sm text-purple-700 dark:text-purple-300 font-black tracking-tight whitespace-nowrap">追更排期强制干预 (跨榜单生效)</span>
                        </div>
                        <div class="text-[11px] md:text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1.5 whitespace-nowrap pl-1">
                            <span>点击添加遗漏新番 · 定向星期排期</span>
                            <span class="text-purple-500 font-bold group-hover:translate-x-1 transition-transform">➔</span>
                        </div>
                    </div>

                    <!-- 1. 当前榜单排序 (高度锁定 h-[88px]，按钮精简为 默认 / 最新 / 热度) -->
                    <div class="w-full xl:w-auto h-[88px] bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md rounded-2xl px-3.5 shadow-sm border border-white dark:border-zinc-700/50 flex flex-col justify-center items-center xl:items-start transition-transform hover:scale-[1.02] shrink-0">
                        <span class="text-[10px] md:text-xs text-indigo-500 dark:text-indigo-400 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1 whitespace-nowrap">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"></path></svg>
                            榜单排序 (自动保存)
                        </span>
                        <div class="flex bg-gray-100/80 dark:bg-zinc-900/80 p-1 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-inner w-full md:w-auto justify-between gap-1">
                            <button id="sort-default" onclick="setSort('default')" class="flex-1 xl:flex-none px-2.5 md:px-3 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-bold transition-all text-gray-500 hover:text-gray-800">默认</button>
                            <button id="sort-year" onclick="setSort('year')" class="flex-1 xl:flex-none px-2.5 md:px-3 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-bold transition-all text-gray-500 hover:text-gray-800">最新</button>
                            <button id="sort-heat" onclick="setSort('heat')" class="flex-1 xl:flex-none px-2.5 md:px-3 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-bold transition-all text-gray-500 hover:text-gray-800">热度</button>
                        </div>
                    </div>

                    <!-- 2 & 3. 大数据盘 (高度锁定 h-[88px]，宽度精简收窄，居中大字号) -->
                    <div class="flex w-full xl:w-auto gap-2.5 md:gap-3 justify-center shrink-0">
                        <div class="flex-1 max-w-sm xl:w-28 h-[88px] bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md rounded-2xl px-2.5 shadow-sm border border-white dark:border-zinc-700/50 flex flex-col items-center justify-center text-center transition-transform hover:scale-[1.02]">
                            <span class="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-1 whitespace-nowrap text-center block w-full">大盘收录</span>
                            <span id="stat-count" class="text-3xl md:text-4xl font-black text-gray-800 dark:text-white tracking-tighter text-center block w-full leading-none">0</span>
                        </div>
                        <div class="flex-1 max-w-sm xl:w-48 h-[88px] bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md rounded-2xl px-4 shadow-sm border border-white dark:border-zinc-700/50 flex flex-col items-center justify-center text-center transition-transform hover:scale-[1.02]">
                            <span class="text-[10px] md:text-xs text-[#ff6b4a] font-bold uppercase tracking-widest mb-1 whitespace-nowrap text-center block w-full">最后一次同步时间</span>
                            <span id="stat-time" class="text-sm md:text-base mt-1 font-black text-gray-800 dark:text-white tracking-tight text-center block w-full">--:--</span>
                        </div>
                    </div>

                </div>

                <div id="movie-grid" class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-6 relative"></div>
            </div>
        </div>
        <div class="lg:hidden fixed bottom-0 left-0 w-full bg-white/70 dark:bg-zinc-900/80 backdrop-blur-2xl border-t border-white/50 dark:border-zinc-800/50 flex justify-start items-center p-2 z-50 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-[0_-10px_20px_rgba(0,0,0,0.02)] overflow-x-auto hide-scrollbar gap-2" id="mob-nav"></div>
    </div>

    <!-- 可视化选图弹窗 (竖版海报选择器) -->
    <div id="poster-select-modal" class="fixed inset-0 z-[150] flex items-center justify-center hidden bg-black/60 backdrop-blur-md transition-opacity">
        <div class="bg-white dark:bg-zinc-900 rounded-[2rem] p-5 md:p-8 w-11/12 max-w-5xl shadow-2xl border border-white/20 fade-in flex flex-col max-h-[90vh]">
            <h3 class="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-2" id="poster-select-title">选择备用【正标带字】竖海报</h3>
            <p class="text-[11px] md:text-sm text-gray-500 dark:text-gray-400 mb-4 font-medium">✨ 系统已自动优先列出<span class="text-pink-600 dark:text-pink-400 font-bold">【官方带字海报】</span>，专供小竖屏列表卡片展示！</p>
            <div class="flex items-center gap-2 mb-4 shrink-0">
                <input type="text" id="custom-poster-url" placeholder="或者直接输入您自定义竖海报的 URL" class="flex-1 bg-gray-100 dark:bg-zinc-800 border-2 border-transparent focus:border-pink-500 rounded-xl px-4 py-2.5 outline-none text-xs md:text-sm text-gray-900 dark:text-white font-bold transition-colors shadow-inner">
                <button onclick="applyCustomPoster()" class="px-5 py-2.5 bg-pink-600 text-white font-bold text-xs md:text-sm rounded-xl shadow-md hover:bg-pink-700 transition-colors shrink-0">直接应用</button>
            </div>
            <div id="poster-select-grid" class="overflow-y-auto flex-1 hide-scrollbar grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 pb-2 content-start auto-rows-max min-h-[30vh] border-y border-gray-100 dark:border-zinc-800 py-4 relative"></div>
            <div class="flex flex-wrap gap-3 justify-end shrink-0 mt-5">
                <button onclick="closeModal('poster-select-modal')" class="flex-1 md:flex-none py-3 px-6 rounded-xl font-bold text-xs md:text-sm text-white bg-gray-400 dark:bg-zinc-700 hover:bg-gray-500 dark:hover:bg-zinc-600 transition-colors shadow-md">关闭取消</button>
            </div>
        </div>
    </div>

    <!-- 可视化选图弹窗 (纯净无字轮播竖海报选择器) -->
    <div id="clean-poster-select-modal" class="fixed inset-0 z-[150] flex items-center justify-center hidden bg-black/60 backdrop-blur-md transition-opacity">
        <div class="bg-white dark:bg-zinc-900 rounded-[2rem] p-5 md:p-8 w-11/12 max-w-5xl shadow-2xl border border-white/20 fade-in flex flex-col max-h-[90vh]">
            <h3 class="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-2" id="clean-poster-select-title">选择备用【纯净无字】轮播竖海报</h3>
            <p class="text-[11px] md:text-sm text-gray-500 dark:text-gray-400 mb-4 font-medium">✨ 此处选择的海报将专门用于<span class="text-cyan-600 dark:text-cyan-400 font-bold">【大轮播图 / Hero 大卡片】</span>叠加透明 Logo 显示，绝不与小列表带字海报冲突！</p>
            <div class="flex items-center gap-2 mb-4 shrink-0">
                <input type="text" id="custom-clean-poster-url" placeholder="或者直接输入您自定义纯净无字竖海报的 URL" class="flex-1 bg-gray-100 dark:bg-zinc-800 border-2 border-transparent focus:border-cyan-500 rounded-xl px-4 py-2.5 outline-none text-xs md:text-sm text-gray-900 dark:text-white font-bold transition-colors shadow-inner">
                <button onclick="applyCustomCleanPoster()" class="px-5 py-2.5 bg-cyan-600 text-white font-bold text-xs md:text-sm rounded-xl shadow-md hover:bg-cyan-700 transition-colors shrink-0">直接应用</button>
            </div>
            <div id="clean-poster-select-grid" class="overflow-y-auto flex-1 hide-scrollbar grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 pb-2 content-start auto-rows-max min-h-[30vh] border-y border-gray-100 dark:border-zinc-800 py-4 relative"></div>
            <div class="flex flex-wrap gap-3 justify-end shrink-0 mt-5">
                <button onclick="closeModal('clean-poster-select-modal')" class="flex-1 md:flex-none py-3 px-6 rounded-xl font-bold text-xs md:text-sm text-white bg-gray-400 dark:bg-zinc-700 hover:bg-gray-500 dark:hover:bg-zinc-600 transition-colors shadow-md">关闭取消</button>
            </div>
        </div>
    </div>

    <!-- 可视化选图弹窗 (Logo) -->
    <div id="logo-select-modal" class="fixed inset-0 z-[150] flex items-center justify-center hidden bg-black/60 backdrop-blur-md transition-opacity">
        <div class="bg-white dark:bg-zinc-900 rounded-[2rem] p-5 md:p-8 w-11/12 max-w-5xl shadow-2xl border border-white/20 fade-in flex flex-col max-h-[90vh]">
            <h3 class="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-2" id="logo-select-title">选择备用 Logo</h3>
            <p class="text-[11px] md:text-sm text-gray-500 dark:text-gray-400 mb-4 font-medium">右上角带有勾选的图即为您目前正在使用的图片。</p>
            <div class="flex items-center gap-2 mb-4 shrink-0">
                <input type="text" id="custom-logo-url" placeholder="或者直接输入您自定义透明图的 URL" class="flex-1 bg-gray-100 dark:bg-zinc-800 border-2 border-transparent focus:border-purple-500 rounded-xl px-4 py-2.5 outline-none text-xs md:text-sm text-gray-900 dark:text-white font-bold transition-colors shadow-inner">
                <button onclick="applyCustomLogo()" class="px-5 py-2.5 bg-purple-600 text-white font-bold text-xs md:text-sm rounded-xl shadow-md hover:bg-purple-700 transition-colors shrink-0">直接应用</button>
            </div>
            <div id="logo-select-grid" class="overflow-y-auto flex-1 hide-scrollbar grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 pb-2 content-start auto-rows-max min-h-[30vh] border-y border-gray-100 dark:border-zinc-800 py-4 relative"></div>
            <div class="flex flex-wrap gap-3 justify-end shrink-0 mt-5">
                <button onclick="applyTextLogo()" class="flex-1 md:flex-none py-3 px-5 rounded-xl font-bold text-xs md:text-sm text-gray-700 bg-gray-100 border border-gray-300 hover:bg-gray-200 transition-colors">🗑️ 放弃图片，强制使用纯白文字</button>
                <button onclick="closeModal('logo-select-modal')" class="flex-1 md:flex-none py-3 px-6 rounded-xl font-bold text-xs md:text-sm text-white bg-gray-400 dark:bg-zinc-700 hover:bg-gray-500 dark:hover:bg-zinc-600 transition-colors shadow-md">关闭取消</button>
            </div>
        </div>
    </div>

    <!-- 可视化选图弹窗 (剧照) -->
    <div id="thumb-select-modal" class="fixed inset-0 z-[150] flex items-center justify-center hidden bg-black/60 backdrop-blur-md transition-opacity">
        <div class="bg-white dark:bg-zinc-900 rounded-[2rem] p-5 md:p-8 w-11/12 max-w-5xl shadow-2xl border border-white/20 fade-in flex flex-col max-h-[90vh]">
            <h3 class="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-2" id="thumb-select-title">选择备用剧照 / 背景</h3>
            <p class="text-[11px] md:text-sm text-gray-500 dark:text-gray-400 mb-4 font-medium">带有特定语言标签的说明它是带字剧照。右上角带有勾选的图即为您目前正在使用的剧照。</p>
            <div class="flex items-center gap-2 mb-4 shrink-0">
                <input type="text" id="custom-thumb-url" placeholder="或者直接输入您自定义横向图片的 URL" class="flex-1 bg-gray-100 dark:bg-zinc-800 border-2 border-transparent focus:border-blue-500 rounded-xl px-4 py-2.5 outline-none text-xs md:text-sm text-gray-900 dark:text-white font-bold transition-colors shadow-inner">
                <button onclick="applyCustomThumb()" class="px-5 py-2.5 bg-blue-600 text-white font-bold text-xs md:text-sm rounded-xl shadow-md hover:bg-blue-700 transition-colors shrink-0">直接应用</button>
            </div>
            <div id="thumb-select-grid" class="overflow-y-auto flex-1 hide-scrollbar grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 pb-2 content-start auto-rows-max min-h-[30vh] border-y border-gray-100 dark:border-zinc-800 py-4 relative"></div>
            <div class="flex flex-wrap gap-3 justify-end shrink-0 mt-5">
                <button onclick="closeModal('thumb-select-modal')" class="flex-1 md:flex-none py-3 px-6 rounded-xl font-bold text-xs md:text-sm text-white bg-gray-400 dark:bg-zinc-700 hover:bg-gray-500 dark:hover:bg-zinc-600 transition-colors shadow-md">关闭取消</button>
            </div>
        </div>
    </div>

    <!-- 定向数据注入弹窗 (Direct Injection) -->
    <div id="override-modal" class="fixed inset-0 z-[160] flex items-center justify-center hidden bg-black/60 backdrop-blur-md transition-opacity">
        <div class="bg-white dark:bg-zinc-900 rounded-[2rem] p-5 md:p-8 w-11/12 max-w-2xl shadow-2xl border border-white/20 fade-in flex flex-col max-h-[90vh]">
            <h3 class="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-2">🛠️ 定向入库引擎 (无污染)</h3>
            <p class="text-[11px] md:text-sm text-gray-500 dark:text-gray-400 mb-4 font-medium">在此处添加的影片将被<span class="text-blue-500 font-bold">直接提取并硬塞入当前所在的榜单（阅后即焚，不污染其他分类）</span>。</p>
            
            <div class="flex flex-col md:flex-row gap-2 mb-4 shrink-0 bg-gray-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-gray-100 dark:border-zinc-700/50">
                <input type="text" id="override-key" placeholder="输入准确的影片名称 或 TMDB ID" class="flex-1 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-600 focus:border-purple-500 rounded-xl px-4 py-2.5 outline-none text-xs md:text-sm text-gray-900 dark:text-white font-bold transition-colors">
                <div class="flex gap-2">
                    <select id="override-day" class="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-600 focus:border-purple-500 rounded-xl px-3 py-2.5 outline-none text-xs md:text-sm font-bold text-gray-700 dark:text-gray-200 cursor-pointer">
                        <option value="1">周一</option><option value="2">周二</option><option value="3">周三</option>
                        <option value="4">周四</option><option value="5">周五</option><option value="6">周六</option><option value="7">周日</option>
                    </select>
                    <button onclick="addOverride()" class="px-5 py-2.5 bg-purple-600 text-white font-bold text-xs md:text-sm rounded-xl shadow-md hover:bg-purple-700 transition-colors whitespace-nowrap">➕ 暂存</button>
                </div>
            </div>
            
            <div class="flex justify-between items-center mb-2 px-1">
                <span class="text-xs font-bold text-gray-800 dark:text-gray-200">待注入的队列</span>
                <div class="flex gap-2">
                    <button onclick="clearAllOverrides()" class="text-[11px] md:text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-700 bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 px-3 py-1.5 rounded-lg transition-colors shadow-sm">🗑️ 清空队列</button>
                    <button onclick="openBulkImport()" class="text-[11px] md:text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 px-3 py-1.5 rounded-lg transition-colors shadow-sm">📋 批量文本智能识别</button>
                </div>
            </div>
            
            <!-- 智能批量导入面板 -->
            <div id="bulk-import-container" class="hidden flex-1 mb-4 border border-blue-200 dark:border-blue-900/50 rounded-xl p-3 bg-blue-50/50 dark:bg-zinc-800/80 flex flex-col gap-2 min-h-[30vh]">
                <div class="text-[11px] md:text-xs text-blue-600 dark:text-blue-400 font-bold mb-1">直接粘贴包含“周一/星期一”等字眼的纯文本 或 Excel 表格内容：</div>
                <textarea id="bulk-textarea" class="flex-1 w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg p-3 text-xs md:text-sm outline-none focus:border-blue-500 resize-none hide-scrollbar font-medium leading-relaxed" placeholder="支持格式示例：&#10;周一 周二 周三&#10;剧名1 剧名2 剧名3&#10;&#10;或者（推荐加上书名号）：&#10;2025-01-01 周三 国产剧 《驻站》 CCTV-1&#10;周二：《国色芳华》，《白月梵星》"></textarea>
                <div class="flex gap-2 justify-end mt-2 shrink-0">
                    <button onclick="closeBulkImport()" class="px-4 py-2 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 transition-colors">取消导入</button>
                    <button onclick="executeBulkImport()" class="px-4 py-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-colors">🚀 解析进入队列</button>
                </div>
            </div>

            <div id="override-list" class="overflow-y-auto flex-1 mb-4 hide-scrollbar border border-gray-100 dark:border-zinc-800 rounded-xl p-2 bg-gray-50/50 dark:bg-zinc-800/30 flex flex-col gap-2 min-h-[30vh]">
            </div>
            
            <div class="flex flex-wrap gap-3 justify-end shrink-0">
                <button onclick="closeModal('override-modal')" class="flex-1 md:flex-none py-3 px-6 rounded-xl font-bold text-xs md:text-sm text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-zinc-800 hover:bg-gray-300 transition-colors">关闭取消</button>
                <button onclick="directInjectItems()" class="flex-1 md:flex-none py-3 px-6 rounded-xl font-bold text-xs md:text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-xl hover:scale-105 transition-transform flex justify-center items-center gap-1 md:gap-2">🚀 一键提取数据并入库</button>
            </div>
        </div>
    </div>

    <!-- 操作确认弹窗 -->
    <div id="confirm-modal" class="fixed inset-0 z-[100] flex items-center justify-center hidden bg-black/40 backdrop-blur-sm transition-opacity">
        <div class="bg-white dark:bg-zinc-900 rounded-[2rem] p-6 md:p-8 w-11/12 max-w-md shadow-2xl border border-white/20 fade-in">
            <h3 class="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-2">操作确认 ⚡</h3>
            <p id="confirm-desc" class="text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium">请确认是否执行？</p>
            <div id="sync-limit-container" class="hidden flex-col gap-3 mb-6 bg-orange-50 dark:bg-orange-900/10 p-4 rounded-2xl border border-orange-200 dark:border-orange-500/20">
                <div class="flex items-center justify-between">
                    <div>
                        <div class="text-sm font-black text-gray-800 dark:text-gray-200">大盘总容量限定</div>
                        <div class="text-[10px] md:text-xs text-gray-500 mt-1">每次同步固定保持这么多部影视</div>
                    </div>
                    <select id="sync-limit-select" class="bg-white dark:bg-zinc-900 border-2 border-orange-200 dark:border-zinc-700 rounded-xl px-3 py-2 outline-none text-sm font-bold text-orange-600 dark:text-orange-500 shadow-sm focus:border-orange-500 transition-colors cursor-pointer">
                        <option value="39">前 39 部</option>
                        <option value="60">前 60 部</option>
                        <option value="100" selected>前 100 部</option>
                    </select>
                </div>
            </div>
            <div class="flex gap-3 justify-end">
                <button onclick="closeModal('confirm-modal')" class="w-1/2 py-3 rounded-xl font-bold text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-zinc-800 hover:bg-gray-300 transition-colors">取消</button>
                <button onclick="executeAction()" id="modal-confirm-btn" class="w-1/2 py-3 rounded-xl font-bold text-white shadow-[0_5px_15px_rgba(255,107,74,0.3)] hover:scale-105 transition-transform">确认执行</button>
            </div>
        </div>
    </div>

    <!-- 批量更新弹窗 -->
    <div id="batch-modal" class="fixed inset-0 z-[100] flex items-center justify-center hidden bg-black/40 backdrop-blur-sm transition-opacity">
        <div class="bg-white dark:bg-zinc-900 rounded-[2rem] p-5 md:p-8 w-11/12 max-w-3xl shadow-2xl border border-white/20 fade-in flex flex-col max-h-[90vh]">
            <h3 class="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-2">📦 批量全自动同步</h3>
            <p class="text-[11px] md:text-sm text-gray-500 dark:text-gray-400 mb-4 font-medium">一键自动更新所有勾选榜单的最新的影片列表数据。</p>
            <div class="overflow-y-auto flex-1 mb-6 hide-scrollbar pr-2 border-y border-gray-100 dark:border-zinc-800 py-4">
                <div class="flex justify-between items-center mb-3">
                    <span class="text-xs md:text-sm font-bold text-gray-800 dark:text-gray-200">选择要同步的榜单</span>
                    <div class="flex gap-2">
                        <button onclick="toggleAllBatch(true)" class="text-[10px] md:text-xs font-bold text-blue-500">全选</button>
                        <button onclick="toggleAllBatch(false)" class="text-[10px] md:text-xs font-bold text-gray-500">清空</button>
                    </div>
                </div>
                <div id="batch-checkboxes" class="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3"></div>
            </div>
            <div class="flex items-center justify-between mb-4 bg-orange-50 dark:bg-orange-900/10 p-3 rounded-xl border border-zinc-700 shadow-sm cursor-pointer">
                <div class="text-xs md:text-sm font-black text-gray-800 dark:text-gray-200">抓取总数限定</div>
                <select id="batch-limit-select" class="bg-white dark:bg-zinc-900 border border-orange-200 dark:border-zinc-700 rounded-lg px-2 py-1 outline-none text-xs font-bold text-orange-600 shadow-sm cursor-pointer">
                    <option value="39">前 39 条</option>
                    <option value="60">前 60 条</option>
                    <option value="100" selected>前 100 条</option>
                </select>
            </div>
            <div class="flex gap-3 justify-end shrink-0">
                <button onclick="closeModal('batch-modal')" class="w-1/3 py-3 rounded-xl font-bold text-xs md:text-base text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-zinc-800 hover:bg-gray-300">取消</button>
                <button onclick="executeBatchSync()" class="flex-1 py-3 rounded-xl font-bold text-xs md:text-base text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-xl hover:scale-105 transition-transform flex justify-center items-center gap-1 md:gap-2">
                    🚀 开始批量同步最新片源
                </button>
            </div>
        </div>
    </div>

    <!-- 排版弹窗 -->
    <div id="layout-modal" class="fixed inset-0 z-[100] flex items-center justify-center hidden bg-black/40 backdrop-blur-sm transition-opacity">
        <div class="bg-white dark:bg-zinc-900 rounded-[2rem] p-5 md:p-8 w-11/12 max-w-4xl shadow-2xl border border-white/20 fade-in flex flex-col max-h-[90vh]">
            <h3 class="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-2">🎨 模块选择与智能同步</h3>
            <p class="text-[11px] md:text-sm text-gray-500 dark:text-gray-400 mb-4 font-medium">智能识别增删：勾选的更新/追加，取消勾选的自动删除，绝不干涉你在 GitHub config.ts 里手写的其他代码！支持长按左侧 ☰ 上下拖动自定义排序。</p>
            <div class="flex justify-between items-center mb-2 px-1 mt-2">
                <span class="text-xs font-bold text-gray-800 dark:text-gray-200">模块参数配置</span>
                <div class="flex gap-3">
                    <button onclick="toggleAllLayout(true)" class="text-[11px] font-bold text-blue-500 hover:text-blue-600">全选启用</button>
                    <button onclick="toggleAllLayout(false)" class="text-[11px] font-bold text-gray-500 hover:text-gray-600">全部清空</button>
                </div>
            </div>
            <div class="overflow-y-auto flex-1 mb-6 hide-scrollbar border-y border-gray-100 dark:border-zinc-800">
                <div id="layout-checkboxes" class="flex flex-col"></div>
            </div>
            <div class="flex flex-wrap gap-2 md:gap-3 justify-end shrink-0">
                <button onclick="closeModal('layout-modal')" class="w-1/4 py-3 rounded-xl font-bold text-xs md:text-base text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-zinc-800 hover:bg-gray-300">取消</button>
                <button onclick="copyGeneratedTS()" class="flex-1 py-3 rounded-xl font-bold text-xs md:text-base text-gray-700 bg-gray-100 border border-gray-300 hover:bg-gray-200 shadow-sm transition-transform hover:-translate-y-0.5">复制 TS 源码</button>
                <button onclick="preparePushGithub()" class="flex-1 py-3 rounded-xl font-bold text-xs md:text-base text-white bg-gradient-to-r from-gray-800 to-black dark:from-gray-700 dark:to-gray-900 shadow-xl hover:scale-[1.02] transition-transform flex justify-center items-center gap-1 md:gap-2">
                    智能同步推送至 GitHub
                </button>
            </div>
        </div>
    </div>

    <div id="toast-container" class="fixed top-5 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 w-11/12 max-w-md pointer-events-none"></div>

    <script>
        function escapeTgHtml(str) { return str ? String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : ''; }

        const API_BASE = "/api";
        const ACTION_BASE = "/action";
        let sysPwd = '';
        let pendingCheckedIds = [];
        let sysOverrides = {};
        
        function syncLayoutToCloud(order, layout) {
            if(!sysPwd) return;
            fetch(ACTION_BASE + '/layout_config', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + sysPwd, 'Content-Type': 'application/json' },
                body: JSON.stringify({ order: order, layout: layout })
            }).catch(()=>{});
        }

        // 🌟 1. 全局 CATEGORIES 字典：默认全面支持 V2 标准 (全改为 poster-list / hero-list / collection-list)
        const CATEGORIES = [
            { id: 'weekly_drama_collection', titleKey: 'home.weekly_drama', name: '🇨🇳 国产追剧周更表 (合集)', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z', preset: 'collection-list', type: 'tv', isCollection: true },
            { id: 'weekly_guoman_collection', titleKey: 'home.weekly_guoman', name: '🇨🇳 国漫追番周历表 (合集)', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z', preset: 'collection-list', type: 'tv', isCollection: true },
            { id: 'weekly_anime_collection', titleKey: 'home.weekly_anime', name: '🇯🇵 动漫新番周更表 (合集)', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', preset: 'collection-list', type: 'tv', isCollection: true },
            { id: 'weekly_korean_drama_collection', titleKey: 'home.weekly_korean_drama', name: '🇰🇷 韩剧追剧周更表 (合集)', icon: 'M4 6h16M4 12h16M4 18h7', preset: 'collection-list', type: 'tv', isCollection: true },
            { id: 'weekly_japanese_drama_collection', titleKey: 'home.weekly_japanese_drama', name: '🇯🇵 日剧追剧周更表 (合集)', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 001 1v4a1 1 0 001 1m-6 0h6', preset: 'collection-list', type: 'tv', isCollection: true },
            { id: 'weekly_sea_drama_collection', titleKey: 'home.weekly_sea_drama', name: '🇹🇭 东南亚剧周更表 (合集)', icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9', preset: 'collection-list', type: 'tv', isCollection: true },

            { id: 'tmdb_popular_movies', titleKey: 'home.tmdb_popular_movies', name: '今日热门电影', icon: 'M7 4v16M17 4v16M3 8h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z', preset: 'poster-list', type: 'movie' },
            { id: 'tmdb_popular_tv', titleKey: 'home.tmdb_popular_tv_shows', name: '今日热门电视剧', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z', preset: 'hero-list', type: 'tv' },
            { id: 'bangumi_airing', titleKey: 'home.bangumi_popular_anime', name: '今日热门番剧', icon: 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', preset: 'poster-list', type: 'tv' },
            { id: 'douban_tv_custom', titleKey: 'home.popular_tv_shows', name: '时下热门国产剧', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z', preset: 'poster-list', type: 'tv' },
            { id: 'tmdb_tv_netflix', titleKey: 'home.tmdb_tv_netflix', name: 'Netflix 全球热播好剧', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z', preset: 'poster-list', type: 'tv' },
            { id: 'variety_cn', titleKey: 'home.variety_cn', name: '热门国产综艺', icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z', preset: 'poster-list', type: 'tv' },
            { id: 'variety_kr', titleKey: 'home.variety_kr', name: '爆款韩国综艺', icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z', preset: 'poster-list', type: 'tv' },
            { id: 'variety_global', titleKey: 'home.variety_global', name: '全球流媒体新热综艺', icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z', preset: 'poster-list', type: 'tv' },
            { id: 'tmdb_tv_hbo', titleKey: 'home.tmdb_tv_hbo', name: 'HBO 高分神剧', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z', preset: 'poster-list', type: 'tv' },
            { id: 'tmdb_tv_apple', titleKey: 'home.tmdb_tv_apple', name: 'Apple TV+ 原创精品', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 001 1v4a1 1 0 001 1m-6 0h6', preset: 'poster-list', type: 'tv' },
            { id: 'trakt_movies', titleKey: 'home.trakt_movies', name: '火爆全球欧美大片', icon: 'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z', preset: 'poster-list', type: 'movie' },
            { id: 'tmdb_anime_cn', titleKey: 'home.popular_domestic_anime', name: '热门国产动漫', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z', preset: 'poster-list', type: 'tv' },
            { id: 'trakt_shows', titleKey: 'home.trakt_shows', name: '时下热播欧美剧集', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z', preset: 'poster-list', type: 'tv' },
            { id: 'douban_movies', titleKey: 'home.popular_movies', name: '实时热门电影', icon: 'M7 4v16M17 4v16M3 8h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z', preset: 'poster-list', type: 'movie' },
            { id: 'douban_korean_tv', titleKey: 'home.popular_korean_tv_shows', name: '备受欢迎的韩剧推荐', icon: 'M4 6h16M4 12h16M4 18h7', preset: 'poster-list', type: 'tv' },
            { id: 'tmdb_tv_ja', titleKey: 'home.popular_japanese_tv_shows', name: '细腻又治愈的高人气日剧', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 001 1v4a1 1 0 001 1m-6 0h6', preset: 'poster-list', type: 'tv' },
            { id: 'tmdb_anime_jp', titleKey: 'home.tmdb_anime_jp', name: '近期热门日本动漫', icon: 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', preset: 'poster-list', type: 'tv' },
            { id: 'imdb_top_anime', titleKey: 'home.imdb_top_anime', name: 'IMDb 史诗动漫神作', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z', preset: 'poster-list', type: 'tv' },
            { id: 'prime_hot_anime', titleKey: 'home.prime_hot_anime', name: 'Prime Video 热门日漫', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z', preset: 'poster-list', type: 'tv' },
            { id: 'filmarks_anime_movie', titleKey: 'home.filmarks_anime_movie', name: 'Filmarks 高分剧场版', icon: 'M7 4v16M17 4v16M3 8h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z', preset: 'poster-list', type: 'movie' },
            { id: 'netflix_hot_anime', titleKey: 'home.netflix_hot_anime', name: 'Netflix 独播霸榜日漫', icon: 'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z', preset: 'poster-list', type: 'tv' },
            { id: 'tmdb_anime_top_ja', titleKey: 'home.tmdb_anime_top_ja', name: 'TMDB 高分神作日漫', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z', preset: 'poster-list', type: 'tv' },
            { id: 'tmdb_anime_movie_ja', titleKey: 'home.tmdb_anime_movie_ja', name: '备受好评的动画电影', icon: 'M7 4v16M17 4v16M3 8h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z', preset: 'poster-list', type: 'movie' },
            { id: 'tmdb_tv_es', titleKey: 'home.popular_spanish_tv_shows', name: '时下流行的西语剧集', icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9', preset: 'poster-list', type: 'tv' },
            { id: 'tmdb_tv_tw', titleKey: 'home.popular_taiwanese_tv_shows', name: '台剧当然也不能落下', icon: 'M4 6h16M4 12h16M4 18h7', preset: 'poster-list', type: 'tv' },
            { id: 'tmdb_movie_tw', titleKey: 'home.popular_taiwanese_movies', name: '台味浓浓的宝藏台片', icon: 'M7 4v16M17 4v16M3 8h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z', preset: 'poster-list', type: 'movie' },
            { id: 'tmdb_movie_sea', titleKey: 'home.tmdb_movie_sea', name: '荷尔模超标的东南亚', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z', preset: 'poster-list', type: 'movie' },
            { id: 'tmdb_movie_hk_erotic_comedy', titleKey: 'home.tmdb_movie_hk_erotic_comedy', name: '港产经典风月喜剧', icon: 'M7 4v16M17 4v16M3 8h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z', preset: 'poster-list', type: 'movie' },
            { id: 'tmdb_tv_th', titleKey: 'home.tmdb_tv_th', name: '狗血上头的爆款泰剧', icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9', preset: 'poster-list', type: 'tv' },
            { id: 'tmdb_movie_th', titleKey: 'home.tmdb_movie_th', name: '不止鬼片的泰国电影', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z', preset: 'poster-list', type: 'movie' },
            { id: 'tmdb_tv_bl', titleKey: 'home.tmdb_tv_bl', name: '暧昧拉扯到极致的亚洲耽美神作', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', preset: 'poster-list', type: 'tv' },
            { id: 'netflix_tv_minor', titleKey: 'home.netflix_minor_tv_shows', name: 'Netflix 小语种神剧', icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9', preset: 'poster-list', type: 'tv' },
            { id: 'netflix_movie_minor', titleKey: 'home.netflix_minor_movies', name: '冷门却惊艳的小语种电影', icon: 'M7 4v16M17 4v16M3 8h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z', preset: 'poster-list', type: 'movie' }
        ];

        let currentCategory = 'tmdb_popular_movies';
        let currentWeekday = new Date().getDay() === 0 ? 7 : new Date().getDay(); 
        let currentAction = 'sync-single'; 
        let modalLayoutState = {};
        window.currentFetchedData = []; 

        let categoryOrder = [];
        let dragStartIndex = -1;

        function initCategoryOrder() {
            const savedOrder = JSON.parse(localStorage.getItem('saved_category_order') || '[]');
            const currentIds = CATEGORIES.map(c => c.id);
            let newOrder = savedOrder.filter(id => currentIds.includes(id));
            currentIds.forEach(id => {
                if (!newOrder.includes(id)) newOrder.push(id);
            });
            categoryOrder = newOrder;
        }

        function handleDragStart(e) {
            dragStartIndex = +e.currentTarget.getAttribute('data-index');
            e.dataTransfer.effectAllowed = 'move';
            setTimeout(() => e.target.classList.add('opacity-40', 'scale-[0.98]'), 0);
        }
        function handleDragOver(e) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; return false; }
        function handleDragEnter(e) { e.preventDefault(); const target = e.currentTarget; if(target.classList.contains('draggable-item')) target.classList.add('bg-blue-50', 'dark:bg-blue-900/20'); }
        function handleDragLeave(e) { const target = e.currentTarget; if(target.classList.contains('draggable-item')) target.classList.remove('bg-blue-50', 'dark:bg-blue-900/20'); }
        function handleDrop(e) {
            e.stopPropagation();
            const target = e.currentTarget; target.classList.remove('bg-blue-50', 'dark:bg-blue-900/20');
            const dragEndIndex = +target.getAttribute('data-index');
            if (dragStartIndex !== dragEndIndex && dragStartIndex > -1) {
                const item = categoryOrder.splice(dragStartIndex, 1)[0];
                categoryOrder.splice(dragEndIndex, 0, item);
                localStorage.setItem('saved_category_order', JSON.stringify(categoryOrder));
                syncLayoutToCloud(categoryOrder, JSON.parse(localStorage.getItem('saved_layout_v2')||'{}'));
                renderLayoutModal(); initNav();
            }
            document.querySelectorAll('.draggable-item').forEach(el => el.classList.remove('opacity-40', 'scale-[0.98]'));
            return false;
        }
        function moveCategory(index, direction) {
            if (index + direction < 0 || index + direction >= categoryOrder.length) return;
            const item = categoryOrder.splice(index, 1)[0];
            categoryOrder.splice(index + direction, 0, item);
            localStorage.setItem('saved_category_order', JSON.stringify(categoryOrder));
            syncLayoutToCloud(categoryOrder, JSON.parse(localStorage.getItem('saved_layout_v2')||'{}'));
            renderLayoutModal(); initNav();
        }

        function showToast(message, isError = false) {
            const container = document.getElementById('toast-container');
            const toast = document.createElement('div');
            const bgColor = isError ? 'bg-red-500' : 'bg-[#10b981]';
            toast.className = 'px-5 py-3 rounded-2xl font-bold text-xs md:text-sm text-white shadow-xl transition-all animate-[slideDown_0.3s_ease-out] ' + bgColor + ' w-full text-center z-[9999] pointer-events-auto';
            toast.innerText = message; container.appendChild(toast);
            setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 4000);
        }

        async function doLogin() {
            const pwd = document.getElementById('login-pwd').value;
            if(!pwd) return showToast("请输入密码", true);
            const res = await fetch(API_BASE + '/login', { method: 'POST', headers: { "Authorization": 'Bearer ' + pwd } });
            if(res.ok) { sysPwd = pwd; localStorage.setItem('ep_pwd', pwd); await handleLoginSuccess(); } else { showToast("密码错误", true); }
        }

        function doLogout() {
            localStorage.removeItem('ep_pwd'); sysPwd = ''; document.getElementById('login-pwd').value = '';
            document.getElementById('dashboard-box').classList.add('hidden');
            const overlay = document.getElementById('login-overlay'); overlay.classList.remove('hidden');
            setTimeout(() => { overlay.style.opacity = '1'; }, 50); showToast("已退出管理端");
        }

        async function handleLoginSuccess() {
            try {
                const res = await fetch(API_BASE + '/layout_config?_t=' + Date.now());
                if(res.ok) {
                    const remoteData = await res.json();
                    if(remoteData.order && remoteData.order.length > 0) localStorage.setItem('saved_category_order', JSON.stringify(remoteData.order));
                    if(remoteData.layout && Object.keys(remoteData.layout).length > 0) localStorage.setItem('saved_layout_v2', JSON.stringify(remoteData.layout));
                }
            } catch(e) {}
            initCategoryOrder();
            document.getElementById('login-overlay').style.opacity = '0';
            setTimeout(() => { document.getElementById('login-overlay').classList.add('hidden'); document.getElementById('dashboard-box').classList.remove('hidden'); }, 500);
            initNav(); 
            if(categoryOrder.length > 0) switchCategory(categoryOrder[0]);
        }

        setInterval(() => {
            const clockEl = document.getElementById('led-clock');
            if (clockEl) clockEl.innerText = new Date().toTimeString().substring(0, 8);
        }, 1000);

        let cronIsCurrentlyPaused = false;

        async function pollCronStatus() {
            try {
                const res = await fetch('/api/cron_status?_t=' + Date.now());
                if (!res.ok) return;
                const data = await res.json();
                
                const box = document.getElementById('led-monitor-box');
                const dot = document.getElementById('led-dot');
                const tag = document.getElementById('led-tag');
                const info = document.getElementById('led-info');
                const pauseBtn = document.getElementById('cron-pause-btn');
                const hourSelect = document.getElementById('cron-hour-select');
                if (!box) return;

                cronIsCurrentlyPaused = !!data.isPaused;

                if (hourSelect && typeof data.autoStartHour !== 'undefined') {
                    if (document.activeElement !== hourSelect) {
                        hourSelect.value = data.autoStartHour.toString();
                    }
                }

                if (cronIsCurrentlyPaused) {
                    box.classList.remove('led-active');
                    box.classList.add('led-paused');
                    if (dot) dot.className = 'w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0 shadow-[0_0_8px_#f59e0b]';
                    if (tag) {
                        tag.className = 'font-black px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0';
                        tag.innerText = 'PAUSED';
                    }
                    if (info) info.innerHTML = '<span class="text-amber-400 font-bold">已暂停</span> <span class="opacity-70 text-xs ml-1 text-slate-400">(点击恢复)</span>';
                    if (pauseBtn) {
                        pauseBtn.innerText = "▶️ 恢复";
                        pauseBtn.className = "h-7 px-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm shrink-0 flex items-center justify-center active:scale-95 leading-none";
                    }
                    return;
                }

                box.classList.remove('led-paused');
                box.classList.add('led-active');

                if (pauseBtn) {
                    pauseBtn.innerText = "⏸ 暂停";
                    pauseBtn.className = "h-7 px-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg text-xs font-bold transition-all border border-emerald-500/30 shrink-0 flex items-center justify-center active:scale-95 leading-none";
                }

                if (data.status === "RUNNING") {
                    if (dot) dot.className = 'w-2.5 h-2.5 rounded-full bg-emerald-400 led-blink shrink-0 shadow-[0_0_8px_#10b981]';
                    if (tag) {
                        tag.className = 'font-black px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0';
                        tag.innerText = 'SYNCING';
                    }
                    if (info) {
                        info.innerHTML = '<span class="text-emerald-300 font-bold shrink-0 whitespace-nowrap">全量同步 [' + (data.currentIndex || 0) + '/77]</span> <span class="opacity-80 text-xs text-emerald-400 ml-1.5 shrink-0 whitespace-nowrap">(' + (data.lastTask || '任务执行中') + ')</span>';
                    }
                } else {
                    if (dot) dot.className = 'w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_6px_#10b981]';
                    if (tag) {
                        tag.className = 'font-black px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0';
                        tag.innerText = 'STANDBY';
                    }
                    if (info) {
                        const setH = data.autoStartHour !== undefined ? data.autoStartHour : 3;
                        const timeStr = (setH < 10 ? '0' + setH : setH) + ':00';
                        info.innerHTML = '<span class="text-emerald-300 font-bold">待命</span> <span class="opacity-70 text-xs text-slate-400 ml-1">(' + timeStr + '更新)</span>';
                    }
                }
            } catch(e) {}
        }
        setInterval(pollCronStatus, 4000);
        setTimeout(pollCronStatus, 500);

        function enablePcDragScroll() {
            const box = document.getElementById('led-monitor-box');
            if (!box) return;

            let isDown = false;
            let startX = 0;
            let scrollLeft = 0;

            box.addEventListener('mousedown', (e) => {
                if (e.target.closest('button, select, option, input, a')) return;
                isDown = true;
                box.classList.add('cursor-grabbing');
                box.classList.remove('cursor-grab');
                startX = e.pageX - box.offsetLeft;
                scrollLeft = box.scrollLeft;
            });

            box.addEventListener('mouseleave', () => {
                isDown = false;
                box.classList.remove('cursor-grabbing');
                box.classList.add('cursor-grab');
            });

            box.addEventListener('mouseup', () => {
                isDown = false;
                box.classList.remove('cursor-grabbing');
                box.classList.add('cursor-grab');
            });

            box.addEventListener('mousemove', (e) => {
                if (!isDown) return;
                e.preventDefault();
                const x = e.pageX - box.offsetLeft;
                const walk = (x - startX) * 1.5;
                box.scrollLeft = scrollLeft - walk;
            });

            box.addEventListener('wheel', (e) => {
                if (box.scrollWidth > box.clientWidth) {
                    e.preventDefault();
                    box.scrollLeft += e.deltaY;
                }
            }, { passive: false });
        }

        setTimeout(enablePcDragScroll, 300);

        async function triggerCronNow() {
            if (!sysPwd) return showToast("请先登录管理员", true);
            if (!confirm("🚀 确认立即启动一轮全量同步？系统将全速推进跑完所有任务并在完成时发送TG通知。")) return;
            
            showToast("🚀 正在启动全量大盘同步...");
            try {
                let finished = false;
                while (!finished) {
                    const res = await fetch(ACTION_BASE + '/start_cron_now', {
                        method: 'POST',
                        headers: { 'Authorization': 'Bearer ' + sysPwd }
                    });
                    const data = await res.json();
                    if (!data.success) {
                        showToast("❌ 运行异常: " + (data.error || "未知错误"), true);
                        break;
                    }
                    
                    pollCronStatus();
                    
                    if (data.data && data.data.status === "IDLE") {
                        finished = true;
                        showToast("🎉 全量 77 个任务已全部跑完！请查看 Telegram 总结明细。");
                        loadData(currentCategory);
                        break;
                    } else {
                        showToast("⚡ 正在极速推进大盘任务: " + (data.data ? data.data.progress : '执行中') + " ...");
                        await new Promise(r => setTimeout(r, 1000));
                    }
                }
            } catch(e) { showToast("❌ 网络请求异常", true); }
        }

        async function changeAutoStartTime(hour) {
            if (!sysPwd) return showToast("请先登录管理员", true);
            try {
                const res = await fetch(ACTION_BASE + '/set_cron_time', {
                    method: 'POST',
                    headers: { 'Authorization': 'Bearer ' + sysPwd, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ hour: parseInt(hour, 10) })
                });
                const data = await res.json();
                if (data.success) {
                    showToast("✅ 定时启动时间已成功更新为每日 " + (data.autoStartHour < 10 ? '0' + data.autoStartHour : data.autoStartHour) + ":00！");
                    pollCronStatus();
                } else {
                    showToast("❌ 设置失败: " + data.error, true);
                }
            } catch(e) { showToast("❌ 网络请求异常", true); }
        }

        async function toggleCronPause() {
            if (!sysPwd) return showToast("请先登录管理员", true);
            const targetState = !cronIsCurrentlyPaused;
            showToast(targetState ? "⏳ 正在暂停后台自动轮询..." : "⏳ 正在恢复后台自动轮询...");
            try {
                const res = await fetch(ACTION_BASE + '/toggle_cron', {
                    method: 'POST',
                    headers: { 'Authorization': 'Bearer ' + sysPwd, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ paused: targetState })
                });
                const data = await res.json();
                if (data.success) {
                    showToast(targetState ? "⏸ 后台自动更新已暂停！" : "▶️ 后台自动更新已恢复运行！");
                    pollCronStatus();
                } else showToast("❌ 操作失败: " + data.error, true);
            } catch(e) { showToast("❌ 网络异常", true); }
        }

        window.onload = async () => {
            const storedPwd = localStorage.getItem('ep_pwd');
            if(storedPwd) {
                const res = await fetch(API_BASE + '/login', { method: 'POST', headers: { "Authorization": 'Bearer ' + storedPwd } });
                if(res.ok) { sysPwd = storedPwd; await handleLoginSuccess(); } else { localStorage.removeItem('ep_pwd'); }
            }
        };

        function openConfirmModal(action) {
            currentAction = action; let desc = "";
            let btn = document.getElementById('modal-confirm-btn');
            if(action === 'sync-single') document.getElementById('sync-limit-container').classList.remove('hidden');
            else document.getElementById('sync-limit-container').classList.add('hidden');

            if (action === 'sync-single') {
                desc = "抓取并同步该分类的最新的源片单数据。新番周更表由于包含一整周7天的数据，云端抓取大约需要25秒，请耐心等待文件生成。";
                btn.className = "w-1/2 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-[#ff6b4a] to-[#e53a1a] shadow-md hover:scale-105 transition-transform"; btn.innerText = "同步最新数据";
            } else if (action === 'push-github') {
                desc = "即将以【精准增量合并模式】将选中的模块合并进入 GitHub 项目的 config.ts，绝对保留你在 GitHub 上原有的其他分类和手动代码！";
                btn.className = "w-1/2 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-gray-800 to-black shadow-md hover:scale-105 transition-transform"; btn.innerText = "确认增量合并";
            } else if (action === 'tg-webhook') {
                desc = "绑定后，可直接在 Telegram 发送 /sync 唤出更新面板，实现全平台双向交互。";
                btn.className = "w-1/2 py-3 rounded-xl font-bold text-white bg-[#0088cc] shadow-md hover:scale-105 transition-transform"; btn.innerText = "一键激活 TG 机器人";
            }
            document.getElementById('confirm-desc').innerText = desc;
            document.getElementById('confirm-modal').classList.remove('hidden');
        }

        function openOverrideModal() {
            document.getElementById('override-modal').classList.remove('hidden');
            document.getElementById('override-day').value = currentWeekday.toString(); 
            renderOverrideList();
        }

        function renderOverrideList() {
            const container = document.getElementById('override-list');
            container.innerHTML = '';
            const keys = Object.keys(sysOverrides);
            if(keys.length === 0) {
                container.innerHTML = '<div class="text-center py-10 text-gray-400 text-xs font-bold">目前暂无任何待注入的影片</div>';
                return;
            }
            const weekdays = ["", "周一", "周二", "周三", "周四", "周五", "周六", "周日"];
            keys.forEach(k => {
                let daysArr = Array.isArray(sysOverrides[k]) ? sysOverrides[k] : [sysOverrides[k]];
                daysArr.sort((a, b) => a - b);
                let badges = daysArr.map(d => '<span class="bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 text-[10px] md:text-xs px-2 py-1 rounded font-black shrink-0">' + weekdays[d] + '</span>').join('');

                container.innerHTML += '<div class="flex justify-between items-center bg-white dark:bg-zinc-900 p-3 rounded-lg shadow-sm border border-gray-100 dark:border-zinc-700 hover:border-purple-300 transition-colors group">' +
                    '<div class="flex items-center gap-2 flex-wrap">' +
                        badges +
                        '<span class="text-xs md:text-sm font-bold text-gray-800 dark:text-gray-200 truncate ml-1">' + escapeTgHtml(k) + '</span>' +
                    '</div>' +
                    '<button onclick="removeOverride(\\'' + k.replace(/'/g, "\\\\'") + '\\')" class="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 p-1.5 rounded-md transition-colors shrink-0 opacity-50 group-hover:opacity-100" title="删除规则">' +
                        '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>' +
                    '</button>' +
                '</div>';
            });
        }

        function addOverride() {
            const keyInput = document.getElementById('override-key');
            const dayInput = document.getElementById('override-day');
            const key = keyInput.value.trim();
            const day = parseInt(dayInput.value, 10);
            
            if(!key) return showToast("请输入准确的影片名称或 TMDB ID", true);
            
            if (typeof sysOverrides[key] === 'undefined') sysOverrides[key] = [];
            else if (!Array.isArray(sysOverrides[key])) sysOverrides[key] = [sysOverrides[key]];

            if (!sysOverrides[key].includes(day)) {
                sysOverrides[key].push(day);
                showToast("✅ 已暂存: " + key + " -> 星期" + day);
            } else {
                showToast("⚠️ " + key + " 已在星期" + day + "的队列中，已自动去重");
            }
            keyInput.value = '';
            renderOverrideList();
        }

        function removeOverride(key) { delete sysOverrides[key]; renderOverrideList(); }
        function clearAllOverrides() { sysOverrides = {}; renderOverrideList(); showToast("🗑️ 暂存队列已彻底清空"); }
        
        function openBulkImport() {
            document.getElementById('bulk-import-container').classList.remove('hidden');
            document.getElementById('override-list').classList.add('hidden');
            document.getElementById('bulk-textarea').value = '';
        }

        function closeBulkImport() {
            document.getElementById('bulk-import-container').classList.add('hidden');
            document.getElementById('override-list').classList.remove('hidden');
        }

        function executeBulkImport() {
            try {
                const text = document.getElementById('bulk-textarea').value;
                if(!text.trim()) return showToast("请输入需要识别的内容", true);
                
                let addedCount = 0;
                let dupCount = 0; 
                const lines = text.trim().split('\\n');
                const dayToNum = { '一':1, '1':1, '二':2, '2':2, '三':3, '3':3, '四':4, '4':4, '五':5, '5':5, '六':6, '6':6, '日':7, '天':7, '7':7 };

                let isGridFormat = false;
                let headerRowIdx = -1;
                let colToDay = {};
                
                for (let i = 0; i < Math.min(lines.length, 10); i++) {
                    const rowDays = [...lines[i].matchAll(/(?:周|星期)([一二三四五六日天1234567])/g)];
                    if (rowDays.length >= 2) {
                        headerRowIdx = i;
                        isGridFormat = true;
                        const headers = lines[i].split(/\\t/);
                        const cellsHeader = headers.length > 1 ? headers : lines[i].split(/\\s+/);
                        cellsHeader.forEach((h, idx) => {
                            const match = h.match(/(?:周|星期)([一二三四五六日天1234567])/);
                            if (match) colToDay[idx] = dayToNum[match[1]];
                        });
                        break;
                    }
                }

                if (isGridFormat) {
                    for (let i = headerRowIdx + 1; i < lines.length; i++) {
                        const cols = lines[i].split(/\\t/);
                        const cells = cols.length > 1 ? cols : lines[i].split(/\\s{2,}/);
                        cells.forEach((cell, idx) => {
                            const title = cell.trim();
                            if (title && colToDay[idx] && !title.match(/(?:周|星期)[一二三四五六日天1234567]/)) {
                                if (typeof sysOverrides[title] === 'undefined') sysOverrides[title] = [];
                                else if (!Array.isArray(sysOverrides[title])) sysOverrides[title] = [sysOverrides[title]];
                                
                                if (!sysOverrides[title].includes(colToDay[idx])) {
                                    sysOverrides[title].push(colToDay[idx]);
                                    addedCount++;
                                } else {
                                    dupCount++;
                                }
                            }
                        });
                    }
                } else {
                    lines.forEach(line => {
                        const cleanedLine = line.trim();
                        if(!cleanedLine) return;
                        const matchDay = cleanedLine.match(/(?:周|星期)([一二三四五六日天1234567])/);
                        const matchTitle = cleanedLine.match(/《([^》]+)》/);
                        
                        if (matchDay) {
                            const day = dayToNum[matchDay[1]];
                            if (matchTitle) {
                                const title = matchTitle[1].trim();
                                if (title) { 
                                    if (typeof sysOverrides[title] === 'undefined') sysOverrides[title] = [];
                                    else if (!Array.isArray(sysOverrides[title])) sysOverrides[title] = [sysOverrides[title]];
                                    
                                    if (!sysOverrides[title].includes(day)) { sysOverrides[title].push(day); addedCount++; } 
                                    else { dupCount++; }
                                }
                            } else {
                                const parts = cleanedLine.split(/(?:周|星期)[一二三四五六日天1234567][:：\\s]*/);
                                const remainder = parts.length > 1 ? parts[1] : cleanedLine;
                                const items = remainder.split(/[、，,；;\\t\\s]+/);
                                items.forEach(item => {
                                    const title = item.trim();
                                    if (title && !title.match(/^[0-9/\\-]+$/) && !title.match(/剧|综艺|晚会|节目|动画|动漫/) && !title.match(/腾讯|爱奇艺|优酷|芒果|CCTV|卫视|平台/i)) {
                                        if (typeof sysOverrides[title] === 'undefined') sysOverrides[title] = [];
                                        else if (!Array.isArray(sysOverrides[title])) sysOverrides[title] = [sysOverrides[title]];
                                        
                                        if (!sysOverrides[title].includes(day)) { sysOverrides[title].push(day); addedCount++; } 
                                        else { dupCount++; }
                                    }
                                });
                            }
                        }
                    });
                }
                
                if (addedCount > 0 || dupCount > 0) {
                    showToast("🎉 解析完毕！新增待注 " + addedCount + " 条，已自动拦截 " + dupCount + " 条重复项。");
                    closeBulkImport();
                    renderOverrideList();
                } else {
                    showToast("⚠️ 未能识别出排期，请检查格式是否带有“周一/星期一”等字眼", true);
                }
            } catch (err) {
                showToast("❌ 解析引擎发生错误: " + err.message, true);
            }
        }

        async function directInjectItems() {
            const keys = Object.keys(sysOverrides);
            if (keys.length === 0) return showToast("⚠️ 队列为空，请先添加或识别影片", true);
            
            const entries = Object.entries(sysOverrides);
            const CHUNK_SIZE = 15;
            const totalBatches = Math.ceil(entries.length / CHUNK_SIZE);
            
            let totalInjected = 0;
            let hasError = false;

            for (let i = 0; i < totalBatches; i++) {
                showToast("🚀 正在注入第 " + (i + 1) + "/" + totalBatches + " 批数据，请勿关闭弹窗...");
                const chunk = entries.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
                const chunkObj = {};
                chunk.forEach(([k, v]) => chunkObj[k] = v);

                try {
                    const res = await fetch(ACTION_BASE + '/direct_inject', {
                        method: 'POST',
                        headers: { 'Authorization': 'Bearer ' + sysPwd, 'Content-Type': 'application/json' },
                        body: JSON.stringify({ items: chunkObj, category: currentCategory })
                    });
                    const data = await res.json();
                    if (data.success) {
                        totalInjected += data.count;
                    } else {
                        hasError = true;
                        showToast("❌ 第 " + (i + 1) + " 批注入失败: " + data.error, true);
                        break;
                    }
                } catch(e) { 
                    hasError = true;
                    showToast("❌ 第 " + (i + 1) + " 批网络异常，自动中断", true); 
                    break;
                }
            }

            if (!hasError || totalInjected > 0) {
                showToast("🎉 全量执行完毕！共 " + totalInjected + " 部影片成功入库！");
                sysOverrides = {}; 
                closeModal('override-modal');
                loadData(currentCategory); 
            }
        }

        function openBatchModal() {
            initCategoryOrder();
            const container = document.getElementById('batch-checkboxes'); container.innerHTML = '';
            categoryOrder.forEach(id => {
                const c = CATEGORIES.find(cat => cat.id === id);
                if (!c || c.isStatic) return; 
                container.innerHTML += '<label class="flex items-center gap-2 p-2 bg-gray-50 dark:bg-zinc-800 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors border border-gray-200 dark:border-zinc-700 cursor-pointer">' +
                    '<input type="checkbox" value="' + c.id + '" class="batch-cb w-4 h-4 accent-blue-600 shrink-0">' +
                    '<span class="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">' + c.name + '</span>' +
                '</label>';
            });
            document.getElementById('batch-modal').classList.remove('hidden');
        }

        function toggleAllBatch(check) { document.querySelectorAll('.batch-cb').forEach(cb => cb.checked = check); }
        function closeModal(id) { 
            document.getElementById(id).classList.add('hidden'); 
            if (id === 'layout-modal') {
                localStorage.setItem('saved_layout_v2', JSON.stringify(modalLayoutState));
                syncLayoutToCloud(categoryOrder, modalLayoutState);
            }
        }

        function updateSortAndRender(id, sortValue) {
            if (!modalLayoutState[id]) return;
            modalLayoutState[id].sort = sortValue;
            localStorage.setItem('saved_layout_v2', JSON.stringify(modalLayoutState));
            syncLayoutToCloud(categoryOrder, modalLayoutState);
            if (id === currentCategory) setSort(sortValue);
        }

        function setSort(type) {
            let savedV2 = JSON.parse(localStorage.getItem('saved_layout_v2') || '{}');
            if (!savedV2[currentCategory]) {
                const catInfo = CATEGORIES.find(c => c.id === currentCategory);
                savedV2[currentCategory] = { checked: true, preset: catInfo.preset, sort: 'default' };
            }
            savedV2[currentCategory].sort = type;
            localStorage.setItem('saved_layout_v2', JSON.stringify(savedV2));
            if(modalLayoutState[currentCategory]) modalLayoutState[currentCategory].sort = type;
            syncLayoutToCloud(categoryOrder, savedV2);
            renderGrid();
        }

        function updateLogoToolbar() {
            const items = window.currentFetchedData || [];
            const checkedBoxes = document.querySelectorAll('.logo-checkbox:checked');
            const checkedCount = checkedBoxes.length;
            const hasLogoCount = items.filter(i => !!i.logo && !i.logo.includes("text_logo.svg")).length;
            const grid = document.getElementById('movie-grid');
            if (!grid) return;
            
            let bar = document.getElementById('logo-toolbar');
            if (!bar) {
                bar = document.createElement('div');
                bar.id = 'logo-toolbar';
                bar.className = 'col-span-full flex flex-col md:flex-row items-center justify-between mb-3 px-4 py-3 bg-white/70 dark:bg-zinc-800/70 backdrop-blur-xl rounded-2xl border border-white/50 dark:border-zinc-700/50 shadow-sm gap-2 w-full transition-all';
                grid.insertBefore(bar, grid.firstChild);
            }
            
            bar.innerHTML = '<div class="text-[11px] md:text-sm font-bold text-gray-600 dark:text-gray-300">' +
                    '已选 <span class="text-purple-600 dark:text-purple-400 text-sm md:text-base font-black">' + checkedCount + '</span> 部 <span class="mx-2 text-gray-300 dark:zinc-600">|</span> 大盘已有真实Logo: <span class="text-emerald-600 dark:text-emerald-400">' + hasLogoCount + '</span> / ' + items.length +
                '</div>' +
                '<div class="flex gap-2 w-full md:w-auto justify-end">' +
                    '<button onclick="document.querySelectorAll(\\'.logo-checkbox\\').forEach(c => c.checked=true); updateLogoToolbar()" class="px-3 py-1.5 text-[11px] font-bold text-indigo-600 bg-indigo-100 rounded-lg hover:bg-indigo-200 transition-colors shadow-sm">全选</button>' +
                    '<button onclick="document.querySelectorAll(\\'.logo-checkbox\\').forEach(c => c.checked=false); updateLogoToolbar()" class="px-3 py-1.5 text-[11px] font-bold text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors shadow-sm">清空</button>' +
                    '<button onclick="batchRemoveItems()" class="px-3 py-1.5 text-[11px] font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors shadow-sm" title="仅从当前列表中移除，下次同步仍可恢复">🗑️ 批量移除</button>' +
                    '<button onclick="batchBlacklistItems()" class="px-3 py-1.5 text-[11px] font-bold text-gray-300 bg-zinc-800 hover:bg-black rounded-lg transition-colors shadow-sm border border-zinc-700" title="加入当前分类的黑名单，以后不再同步拉取">🛡️ 批量分类封禁</button>' +
                '</div>';
        }

        async function removeItem(e, tmdbId) {
            e.stopPropagation();
            showToast("🗑️ 正在从当前列表中移除...");
            try {
                const res = await fetch(ACTION_BASE + '/delete_item', {
                    method: 'POST', 
                    headers: { 'Authorization': 'Bearer ' + sysPwd, 'Content-Type': 'application/json' }, 
                    body: JSON.stringify({ tmdbId, category: currentCategory, weekday: currentWeekday, mode: 'remove' })
                });
                const data = await res.json();
                if (data.success) { showToast("✅ 已成功从当前列表中移除！"); loadData(currentCategory); } else showToast("❌ 移除失败: " + data.error, true);
            } catch(err) { showToast("❌ 网络异常", true); }
        }

        async function blacklistItem(e, tmdbId, title) {
            e.stopPropagation();
            const catObj = CATEGORIES.find(c => c.id === currentCategory);
            const catName = catObj ? catObj.name : currentCategory;
            
            if (!confirm("🛡️ 确认黑名单封禁：\\n\\n是否确定将《" + title + "》加入【" + catName + "】黑名单？\\n\\n⚠️ 注意：封禁后，系统在此分类下将永远不再自动拉取该片。其他分类不受影响！")) return;

            showToast("🛡️ 正在加入【当前分类】黑名单...");
            try {
                const res = await fetch(ACTION_BASE + '/delete_item', {
                    method: 'POST', 
                    headers: { 'Authorization': 'Bearer ' + sysPwd, 'Content-Type': 'application/json' }, 
                    body: JSON.stringify({ tmdbId, category: currentCategory, weekday: currentWeekday, mode: 'blacklist' })
                });
                const data = await res.json();
                if (data.success) { showToast("✅ 已加入【当前分类】黑名单！"); loadData(currentCategory); } else showToast("❌ 封禁失败: " + data.error, true);
            } catch(err) { showToast("❌ 网络异常", true); }
        }

        async function batchRemoveItems() {
            const checkedBoxes = document.querySelectorAll('.logo-checkbox:checked');
            if (checkedBoxes.length === 0) return showToast("⚠️ 请至少勾选一部影片！", true);
            
            const ids = Array.from(checkedBoxes).map(cb => cb.value);
            showToast("🗑️ 正在批量从列表移除...");
            try {
                const res = await fetch(ACTION_BASE + '/batch_delete', {
                    method: 'POST',
                    headers: { 'Authorization': 'Bearer ' + sysPwd, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tmdbIds: ids, category: currentCategory, weekday: currentWeekday, mode: 'remove' })
                });
                const data = await res.json();
                if (data.success) {
                    showToast("✅ 成功移除 " + ids.length + " 部影片！");
                    loadData(currentCategory);
                } else {
                    showToast("❌ 移除失败: " + data.error, true);
                }
            } catch(err) { showToast("❌ 网络异常", true); }
        }

        async function batchBlacklistItems() {
            const checkedBoxes = document.querySelectorAll('.logo-checkbox:checked');
            if (checkedBoxes.length === 0) return showToast("⚠️ 请至少勾选一部影片！", true);

            const catObj = CATEGORIES.find(c => c.id === currentCategory);
            const catName = catObj ? catObj.name : currentCategory;
            
            if (!confirm("🛡️ 批量分类封禁确认：\\n\\n是否确定将选中的 " + checkedBoxes.length + " 部影片加入【" + catName + "】黑名单？\\n\\n⚠️ 以后在该分类同步时将彻底跳过这些影片，其他分类不受影响。")) return;
            
            const ids = Array.from(checkedBoxes).map(cb => cb.value);
            showToast("🛡️ 正在批量加入【当前分类】黑名单...");
            try {
                const res = await fetch(ACTION_BASE + '/batch_delete', {
                    method: 'POST',
                    headers: { 'Authorization': 'Bearer ' + sysPwd, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tmdbIds: ids, category: currentCategory, weekday: currentWeekday, mode: 'blacklist' })
                });
                const data = await res.json();
                if (data.success) {
                    showToast("✅ 成功封禁 " + ids.length + " 部影片！");
                    loadData(currentCategory);
                } else {
                    showToast("❌ 封禁失败: " + data.error, true);
                }
            } catch(err) { showToast("❌ 网络异常", true); }
        }

        async function batchForceLogos() {
            const checkedBoxes = document.querySelectorAll('.logo-checkbox:checked');
            if(checkedBoxes.length === 0) return showToast("⚠️ 请至少勾选一部影片！", true);
            const itemsToProcess = Array.from(checkedBoxes).map(cb => ({ id: cb.value, type: cb.getAttribute('data-type') || 'movie' }));
            showToast("⏳ 正在排队提取 " + itemsToProcess.length + " 部影片，请耐心等待任务完成...");
            try {
                const res = await fetch(ACTION_BASE + '/batch_force_logo', { 
                    method: 'POST', 
                    headers: { 'Authorization': 'Bearer ' + sysPwd, 'Content-Type': 'application/json' }, 
                    body: JSON.stringify({ items: itemsToProcess, category: currentCategory, weekday: currentWeekday }) 
                });
                const data = await res.json();
                if (data.success) {
                    const processedIds = data.results.map(r => r.tmdbId.toString());
                    const originalIds = itemsToProcess.map(i => i.id.toString());
                    pendingCheckedIds = originalIds.filter(id => !processedIds.includes(id));
                    if (pendingCheckedIds.length > 0) showToast("✅ 已安全提取前 " + processedIds.length + " 个！触发防封禁保护，剩余 " + pendingCheckedIds.length + " 个已自动保留勾选，请再次点击继续！", false);
                    else showToast("✅ 全部 " + originalIds.length + " 部影片提取完毕！主库已更新最优图/标。");
                    loadData(currentCategory);
                } else showToast("❌ 提取失败: " + data.error, true);
            } catch(e) { showToast("❌ 网络异常", true); }
        }

        let activePosterSelectTmdbId = null, activePosterSelectTitle = "", activePosterCurrent = null, activePosterSource = 'auto';
        async function openPosterSelector(e, tmdbId, title, currentPoster, source, mType) {
            e.stopPropagation(); activePosterSelectTmdbId = tmdbId; activePosterSelectTitle = title; activePosterCurrent = currentPoster; activePosterSource = source || 'auto';
            document.getElementById('poster-select-title').innerText = "为《" + title + "》选择备用【正标带字】竖海报";
            document.getElementById('poster-select-grid').innerHTML = '<div class="col-span-full flex flex-col items-center justify-center py-12 text-gray-500"><div class="w-10 h-10 rounded-full border-4 border-gray-300 dark:border-zinc-700 border-t-pink-600 animate-spin mb-4"></div><span class="text-xs font-bold">正在全网扫描海报...</span></div>';
            document.getElementById('custom-poster-url').value = ''; document.getElementById('poster-select-modal').classList.remove('hidden');
            const catObj = CATEGORIES.find(c => c.id === currentCategory); const mediaType = mType || (catObj ? catObj.type : 'movie');
            try {
                const res = await fetch(ACTION_BASE + '/list_posters', { method: 'POST', headers: { 'Authorization': 'Bearer ' + sysPwd, 'Content-Type': 'application/json' }, body: JSON.stringify({ tmdbId, type: mediaType }) });
                const data = await res.json();
                const grid = document.getElementById('poster-select-grid');
                if (!data.success || !data.posters || data.posters.length === 0) { grid.innerHTML = '<div class="col-span-full text-center py-10 text-gray-500 font-bold text-sm">暂无任何海报资源</div>'; return; }
                grid.innerHTML = '';
                data.posters.forEach(obj => {
                    let isCurrent = activePosterCurrent && activePosterCurrent.includes(obj.file_path); let tickColor = activePosterSource === 'manual' ? 'bg-emerald-500' : 'bg-pink-500';
                    const div = document.createElement('div');
                    div.className = "relative w-full pt-[150%] rounded-xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-pink-500 transition-all hover:-translate-y-1 hover:shadow-lg group bg-gray-200 dark:bg-zinc-800 transform-gpu";
                    div.onclick = () => selectAndSavePoster(obj.url);
                    div.innerHTML = '<div class="absolute inset-0 flex items-center justify-center z-10"><img src="' + obj.url + '" loading="lazy" class="w-full h-full object-cover" /></div><div class="absolute top-2 left-2 bg-black/80 text-white text-[10px] px-2 py-1 rounded shadow-sm z-30">' + (obj.isClean ? '✨ 纯净无字' : '带字海报 (' + obj.lang + ')') + '</div>' + (isCurrent ? '<div class="absolute top-2 right-2 ' + tickColor + ' text-white rounded-md p-1 shadow-sm border border-white/20 z-30"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg></div>' : '') + '<div class="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center z-20 transition-all"><span class="text-white font-black text-xs md:text-sm bg-pink-600 px-4 py-1.5 rounded-full shadow-lg transform transition-transform scale-90 group-hover:scale-100">设为正标海报</span></div>';
                    grid.appendChild(div);
                });
            } catch(e) { document.getElementById('poster-select-grid').innerHTML = '<div class="col-span-full text-center py-10 text-red-500 font-bold text-sm">拉取失败</div>'; }
        }
        async function applyCustomPoster() { const url = document.getElementById('custom-poster-url').value.trim(); if (!url) return showToast("请输入有效的图片链接", true); await selectAndSavePoster(url); }
        async function selectAndSavePoster(posterUrl) {
            showToast("⏳ 正在应用新正标海报并更新主库..."); closeModal('poster-select-modal');
            try {
                const res = await fetch(ACTION_BASE + '/update_single_poster', { 
                    method: 'POST', 
                    headers: { 'Authorization': 'Bearer ' + sysPwd, 'Content-Type': 'application/json' }, 
                    body: JSON.stringify({ tmdbId: activePosterSelectTmdbId, poster: posterUrl, category: currentCategory, weekday: currentWeekday }) 
                });
                const data = await res.json();
                if (data.success) { showToast("✅ 正标竖海报更新成功！"); loadData(currentCategory); } else showToast("❌ 更新失败: " + data.error, true);
            } catch(e) { showToast("❌ 请求异常", true); }
        }

        let activeCleanPosterSelectTmdbId = null, activeCleanPosterSelectTitle = "", activeCleanPosterCurrent = null, activeCleanPosterSource = 'auto';
        async function openCleanPosterSelector(e, tmdbId, title, currentCleanPoster, source, mType) {
            e.stopPropagation(); activeCleanPosterSelectTmdbId = tmdbId; activeCleanPosterSelectTitle = title; activeCleanPosterCurrent = currentCleanPoster; activeCleanPosterSource = source || 'auto';
            document.getElementById('clean-poster-select-title').innerText = "为《" + title + "》选择备用【纯净无字】轮播海报";
            document.getElementById('clean-poster-select-grid').innerHTML = '<div class="col-span-full flex flex-col items-center justify-center py-12 text-gray-500"><div class="w-10 h-10 rounded-full border-4 border-gray-300 dark:border-zinc-700 border-t-cyan-600 animate-spin mb-4"></div><span class="text-xs font-bold">正在全网扫描纯净无字海报...</span></div>';
            document.getElementById('custom-clean-poster-url').value = ''; document.getElementById('clean-poster-select-modal').classList.remove('hidden');
            const catObj = CATEGORIES.find(c => c.id === currentCategory); const mediaType = mType || (catObj ? catObj.type : 'movie');
            try {
                const res = await fetch(ACTION_BASE + '/list_posters', { method: 'POST', headers: { 'Authorization': 'Bearer ' + sysPwd, 'Content-Type': 'application/json' }, body: JSON.stringify({ tmdbId, type: mediaType }) });
                const data = await res.json();
                const grid = document.getElementById('clean-poster-select-grid');
                if (!data.success || !data.posters || data.posters.length === 0) { grid.innerHTML = '<div class="col-span-full text-center py-10 text-gray-500 font-bold text-sm">暂无任何海报资源</div>'; return; }
                grid.innerHTML = '';
                data.posters.forEach(obj => {
                    let isCurrent = activeCleanPosterCurrent && activeCleanPosterCurrent.includes(obj.file_path); let tickColor = activeCleanPosterSource === 'manual' ? 'bg-emerald-500' : 'bg-cyan-500';
                    const div = document.createElement('div');
                    div.className = "relative w-full pt-[150%] rounded-xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-cyan-500 transition-all hover:-translate-y-1 hover:shadow-lg group bg-gray-200 dark:bg-zinc-800 transform-gpu";
                    div.onclick = () => selectAndSaveCleanPoster(obj.url);
                    div.innerHTML = '<div class="absolute inset-0 flex items-center justify-center z-10"><img src="' + obj.url + '" loading="lazy" class="w-full h-full object-cover" /></div><div class="absolute top-2 left-2 bg-black/80 text-white text-[10px] px-2 py-1 rounded shadow-sm z-30">' + (obj.isClean ? '✨ 纯净无字' : '带字海报 (' + obj.lang + ')') + '</div>' + (isCurrent ? '<div class="absolute top-2 right-2 ' + tickColor + ' text-white rounded-md p-1 shadow-sm border border-white/20 z-30"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg></div>' : '') + '<div class="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center z-20 transition-all"><span class="text-white font-black text-xs md:text-sm bg-cyan-600 px-4 py-1.5 rounded-full shadow-lg transform transition-transform scale-90 group-hover:scale-100">设为无字轮播图</span></div>';
                    grid.appendChild(div);
                });
            } catch(e) { document.getElementById('clean-poster-select-grid').innerHTML = '<div class="col-span-full text-center py-10 text-red-500 font-bold text-sm">拉取失败</div>'; }
        }
        async function applyCustomCleanPoster() { const url = document.getElementById('custom-clean-poster-url').value.trim(); if (!url) return showToast("请输入有效的图片链接", true); await selectAndSaveCleanPoster(url); }
        async function selectAndSaveCleanPoster(posterUrl) {
            showToast("⏳ 正在应用无字海报并更新主库..."); closeModal('clean-poster-select-modal');
            try {
                const res = await fetch(ACTION_BASE + '/update_single_no_logo_poster', { 
                    method: 'POST', 
                    headers: { 'Authorization': 'Bearer ' + sysPwd, 'Content-Type': 'application/json' }, 
                    body: JSON.stringify({ tmdbId: activeCleanPosterSelectTmdbId, noLogoPoster: posterUrl, category: currentCategory, weekday: currentWeekday }) 
                });
                const data = await res.json();
                if (data.success) { showToast("✅ 无字轮播海报更新成功！"); loadData(currentCategory); } else showToast("❌ 更新失败: " + data.error, true);
            } catch(e) { showToast("❌ 请求异常", true); }
        }
        let activeLogoSelectTmdbId = null, activeLogoSelectTitle = "", activeLogoCurrent = null, activeLogoSource = 'auto'; 
        async function openLogoSelector(e, tmdbId, title, currentLogo, source, mType) {
            e.stopPropagation(); activeLogoSelectTmdbId = tmdbId; activeLogoSelectTitle = title; activeLogoCurrent = currentLogo; activeLogoSource = source || 'auto';
            document.getElementById('logo-select-title').innerText = "为《" + title + "》选择备用 Logo";
            document.getElementById('logo-select-grid').innerHTML = '<div class="col-span-full flex flex-col items-center justify-center py-12 text-gray-500"><div class="w-10 h-10 rounded-full border-4 border-gray-300 dark:border-zinc-700 border-t-purple-600 animate-spin mb-4"></div><span class="text-xs font-bold">正在全网扫描所有候选图...</span></div>';
            document.getElementById('custom-logo-url').value = ''; document.getElementById('logo-select-modal').classList.remove('hidden');
            const catObj = CATEGORIES.find(c => c.id === currentCategory); const mediaType = mType || (catObj ? catObj.type : 'movie');
            try {
                const res = await fetch(ACTION_BASE + '/list_logos', { method: 'POST', headers: { 'Authorization': 'Bearer ' + sysPwd, 'Content-Type': 'application/json' }, body: JSON.stringify({ tmdbId, type: mediaType }) });
                const data = await res.json();
                const grid = document.getElementById('logo-select-grid');
                if (!data.success || !data.logos || data.logos.length === 0) { grid.innerHTML = '<div class="col-span-full text-center py-10 text-gray-500 font-bold text-sm">暂无任何 Logo 资源</div>'; return; }
                grid.innerHTML = '';
                data.logos.forEach(obj => {
                    let isCurrent = activeLogoCurrent && activeLogoCurrent.includes(obj.file_path); let tickColor = activeLogoSource === 'manual' ? 'bg-emerald-500' : 'bg-purple-500';
                    const div = document.createElement('div');
                    div.className = "relative w-full pt-[56.25%] rounded-xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-purple-500 transition-all hover:-translate-y-1 hover:shadow-lg group bg-checker transform-gpu";
                    div.onclick = () => selectAndSaveLogo(obj.url);
                    div.innerHTML = '<div class="absolute inset-0 flex items-center justify-center p-2 z-10"><img src="' + obj.url + '" loading="lazy" class="max-h-full max-w-full object-contain drop-shadow-md" /></div><div class="absolute top-2 left-2 bg-black/80 text-white text-[10px] px-2 py-1 rounded shadow-sm z-30">' + (obj.lang === null || obj.lang === 'xx' ? '纯净Logo' : '带字Logo (' + obj.lang + ')') + '</div>' + (isCurrent ? '<div class="absolute top-2 right-2 ' + tickColor + ' text-white rounded-md p-1 shadow-sm border border-white/20 z-30"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg></div>' : '') + '<div class="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center z-20 transition-all"><span class="text-white font-black text-xs md:text-sm bg-purple-600 px-4 py-1.5 rounded-full shadow-lg transform transition-transform scale-90 group-hover:scale-100">使用此图</span></div>';
                    grid.appendChild(div);
                });
            } catch(e) { document.getElementById('logo-select-grid').innerHTML = '<div class="col-span-full text-center py-10 text-red-500 font-bold text-sm">拉取失败</div>'; }
        }
        async function applyCustomLogo() { const url = document.getElementById('custom-logo-url').value.trim(); if (!url) return showToast("请输入有效的图片链接", true); await selectAndSaveLogo(url); }
        async function applyTextLogo() { await selectAndSaveLogo(""); }
        async function selectAndSaveLogo(logoUrl) {
            showToast("⏳ 正在应用新 Logo 并更新主库..."); closeModal('logo-select-modal');
            try {
                const res = await fetch(ACTION_BASE + '/update_single_logo', { 
                    method: 'POST', 
                    headers: { 'Authorization': 'Bearer ' + sysPwd, 'Content-Type': 'application/json' }, 
                    body: JSON.stringify({ tmdbId: activeLogoSelectTmdbId, logo: logoUrl, title: activeLogoSelectTitle, category: currentCategory, weekday: currentWeekday }) 
                });
                const data = await res.json();
                if (data.success) { showToast("✅ 新 Logo 更新成功！"); loadData(currentCategory); } else showToast("❌ 更新失败: " + data.error, true);
            } catch(e) { showToast("❌ 请求异常", true); }
        }

        let activeThumbSelectTmdbId = null, activeThumbSelectTitle = "", activeThumbCurrent = null, activeThumbSource = 'auto'; 
        async function openThumbSelector(e, tmdbId, title, currentThumb, source, mType) {
            e.stopPropagation(); activeThumbSelectTmdbId = tmdbId; activeThumbSelectTitle = title; activeThumbCurrent = currentThumb; activeThumbSource = source || 'auto';
            document.getElementById('thumb-select-title').innerText = "为《" + title + "》选择备用剧照 / 背景";
            document.getElementById('thumb-select-grid').innerHTML = '<div class="col-span-full flex flex-col items-center justify-center py-12 text-gray-500"><div class="w-10 h-10 rounded-full border-4 border-gray-300 dark:border-zinc-700 border-t-blue-600 animate-spin mb-4"></div><span class="text-xs font-bold">正在全网扫描...</span></div>';
            document.getElementById('custom-thumb-url').value = ''; document.getElementById('thumb-select-modal').classList.remove('hidden');
            const catObj = CATEGORIES.find(c => c.id === currentCategory); const mediaType = mType || (catObj ? catObj.type : 'movie');
            try {
                const res = await fetch(ACTION_BASE + '/list_thumbs', { method: 'POST', headers: { 'Authorization': 'Bearer ' + sysPwd, 'Content-Type': 'application/json' }, body: JSON.stringify({ tmdbId, type: mediaType }) });
                const data = await res.json();
                const grid = document.getElementById('thumb-select-grid');
                if (!data.success || !data.thumbs || data.thumbs.length === 0) { grid.innerHTML = '<div class="col-span-full text-center py-10 text-gray-500 font-bold text-sm">暂无任何剧照资源</div>'; return; }
                grid.innerHTML = '';
                data.thumbs.forEach(obj => {
                    let isCurrent = activeThumbCurrent && activeThumbCurrent.includes(obj.file_path); let tickColor = activeThumbSource === 'manual' ? 'bg-emerald-500' : 'bg-purple-500';
                    const div = document.createElement('div');
                    div.className = "relative w-full pt-[56.25%] rounded-xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-blue-500 transition-all hover:-translate-y-1 hover:shadow-lg group bg-gray-200 dark:bg-zinc-800 transform-gpu";
                    div.onclick = () => selectAndSaveThumb(obj.url);
                    div.innerHTML = '<div class="absolute inset-0 flex items-center justify-center z-10"><img src="' + obj.url + '" loading="lazy" class="w-full h-full object-cover" /></div><div class="absolute top-2 left-2 bg-black/80 text-white text-[10px] px-2 py-1 rounded shadow-sm z-30">' + (obj.lang === null || obj.lang === 'xx' ? '纯净背景' : '带字剧照 (' + obj.lang + ')') + '</div>' + (isCurrent ? '<div class="absolute top-2 right-2 ' + tickColor + ' text-white rounded-md p-1 shadow-sm border border-white/20 z-30"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg></div>' : '') + '<div class="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center z-20 transition-all"><span class="text-white font-black text-xs md:text-sm bg-blue-600 px-4 py-1.5 rounded-full shadow-lg transform transition-transform scale-90 group-hover:scale-100">使用此图</span></div>';
                    grid.appendChild(div);
                });
            } catch(e) { document.getElementById('thumb-select-grid').innerHTML = '<div class="col-span-full text-center py-10 text-red-500 font-bold text-sm">拉取失败</div>'; }
        }
        async function applyCustomThumb() { const url = document.getElementById('custom-thumb-url').value.trim(); if (!url) return showToast("请输入有效的图片链接", true); await selectAndSaveThumb(url); }
        async function selectAndSaveThumb(thumbUrl) {
            showToast("⏳ 正在应用新剧照并更新主库..."); closeModal('thumb-select-modal');
            try {
                const res = await fetch(ACTION_BASE + '/update_single_thumb', { 
                    method: 'POST', 
                    headers: { 'Authorization': 'Bearer ' + sysPwd, 'Content-Type': 'application/json' }, 
                    body: JSON.stringify({ tmdbId: activeThumbSelectTmdbId, thumb: thumbUrl, category: currentCategory, weekday: currentWeekday }) 
                });
                const data = await res.json();
                if (data.success) { showToast("✅ 新剧照更新成功！"); loadData(currentCategory); } else showToast("❌ 更新失败: " + data.error, true);
            } catch(e) { showToast("❌ 请求异常", true); }
        }

        function renderGrid() {
            const grid = document.getElementById("movie-grid");
            if (!window.currentFetchedData || window.currentFetchedData.length === 0) {
                grid.innerHTML = '<div class="col-span-full text-center py-20 text-gray-400 font-bold">大盘暂无数据，请点击更新抓取。</div>'; return;
            }

            let savedV2 = JSON.parse(localStorage.getItem('saved_layout_v2') || '{}');
            let sortType = 'default'; if (savedV2[currentCategory] && savedV2[currentCategory].sort) sortType = savedV2[currentCategory].sort;
            ['default', 'year', 'heat'].forEach(s => {
                const btn = document.getElementById('sort-' + s); if (!btn) return;
                if (s === sortType) btn.className = "flex-1 xl:flex-none px-3 md:px-5 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-bold transition-all bg-white dark:bg-zinc-700 shadow-md text-blue-600 dark:text-blue-400";
                else btn.className = "flex-1 xl:flex-none px-3 md:px-5 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-bold transition-all text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200";
            });

            const extractYearAndDate = (x) => {
                if (!x || typeof x !== 'object') return { year: 0, fullDate: "0000-00-00", isUpcoming: false };
                const rawDateStr = String(
                    x.release_date || x.first_air_date || x.air_date || x.last_episode_air_date || 
                    (Array.isArray(x.pubdates) ? x.pubdates[0] : x.pubdate) || x.year || ""
                ).trim();

                const dateMatch = rawDateStr.match(/\\b(19|20)\\d{2}[-/.]\\d{1,2}[-/.]\\d{1,2}\\b/);
                if (dateMatch) {
                    const parts = dateMatch[0].split(/[-/.]/);
                    const y = parseInt(parts[0], 10);
                    const m = parts[1].padStart(2, '0');
                    const d = parts[2].padStart(2, '0');
                    return { year: y, fullDate: y + '-' + m + '-' + d, isUpcoming: false };
                }

                const yearMatch = rawDateStr.match(/\\b(19|20)\\d{2}\\b/);
                if (yearMatch) {
                    const y = parseInt(yearMatch[0], 10);
                    return { year: y, fullDate: y + '-01-01', isUpcoming: false };
                }

                const currentYear = new Date().getFullYear();
                return { year: currentYear + 1, fullDate: (currentYear + 1) + '-12-31', isUpcoming: true };
            };

            let displayData = [...window.currentFetchedData];
            if (sortType === 'year') {
                displayData.sort((a, b) => {
                    const infoA = extractYearAndDate(a);
                    const infoB = extractYearAndDate(b);
                    if (infoB.year !== infoA.year) return infoB.year - infoA.year;
                    if (infoB.fullDate !== infoA.fullDate) return infoB.fullDate.localeCompare(infoA.fullDate);
                    return (b.vote_average || 0) - (a.vote_average || 0);
                });
            } else if (sortType === 'heat') {
                displayData.sort((a, b) => {
                    const voteDiff = (b.vote_average || 0) - (a.vote_average || 0);
                    if (Math.abs(voteDiff) > 0.01) return voteDiff;
                    return (b.popularity || 0) - (a.popularity || 0);
                });
            }

            grid.innerHTML = ""; const catObj = CATEGORIES.find(c => c.id === currentCategory);

            displayData.forEach(item => {
                const safeTitle = item.title.replace(/'/g, "\\'").replace(/"/g, '&quot;');
                const posterUrl = item.poster_path ? (item.poster_path.startsWith('http') ? item.poster_path : 'https://image.tmdb.org/t/p/original' + item.poster_path) : 'https://via.placeholder.com/500x750?text=No+Poster';
                const mType = item.media_type || (catObj ? catObj.type : 'movie');
                
                const checkboxHtml = '<label class="absolute top-2.5 left-2.5 z-30 cursor-pointer bg-black/50 backdrop-blur-md rounded-md p-1 shadow-sm border border-white/20 flex items-center justify-center transition-all hover:scale-110" onclick="event.stopPropagation()">' +
                    '<input type="checkbox" value="' + item.tmdbId + '" data-type="' + mType + '" class="logo-checkbox w-3.5 h-3.5 accent-purple-600 rounded cursor-pointer border-none" onchange="updateLogoToolbar()">' +
                '</label>';
                
                const actionControlBtns = '<div class="absolute top-2.5 left-11 flex gap-1 z-30">' +
                    '<button onclick="removeItem(event, \\'' + item.tmdbId + '\\')" class="bg-red-600/90 hover:bg-red-500 text-white p-1 rounded-md shadow-sm border border-white/20 transition-all transform hover:scale-110 flex items-center justify-center" title="从当前列表移除（同步可能恢复）">' +
                        '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>' +
                    '</button>' +
                    '<button onclick="blacklistItem(event, \\'' + item.tmdbId + '\\', \\'' + safeTitle + '\\')" class="bg-zinc-800/80 hover:bg-black text-zinc-300 hover:text-red-400 p-1 rounded-md shadow-sm border border-white/20 transition-all transform hover:scale-110 flex items-center justify-center opacity-60 hover:opacity-100" title="加入【当前分类】黑名单（此分类不再同步）">' +
                        '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>' +
                    '</button>' +
                '</div>';
                
                const r = item.ratings || {};
                const tmdbVal = r.tmdb || item.vote_average;
                const imdbVal = r.imdb || item.imdb_rating || item.imdbRating;
                const traktVal = r.trakt || item.trakt_rating;
                const rtVal = r.rotten_tomatoes || item.rotten_tomatoes || item.tomato_rating;

                let badgeItems = [];
                if (tmdbVal && tmdbVal > 0) {
                    badgeItems.push('<span class="flex items-center gap-0.5"><span class="text-yellow-400">★</span>' + Number(tmdbVal).toFixed(1) + '</span>');
                }
                if (imdbVal && imdbVal > 0) {
                    badgeItems.push('<span class="flex items-center gap-0.5"><span class="text-yellow-500 font-black">IMDb</span>' + Number(imdbVal).toFixed(1) + '</span>');
                }
                if (traktVal && traktVal > 0) {
                    badgeItems.push('<span class="flex items-center gap-0.5"><span class="text-red-400 font-black">Trakt</span>' + Number(traktVal).toFixed(1) + '</span>');
                }
                if (rtVal && rtVal > 0) {
                    badgeItems.push('<span class="flex items-center gap-0.5"><span>🍅</span>' + rtVal + '%</span>');
                }

                const ratingBadge = badgeItems.length > 0 
                    ? '<div class="absolute top-2.5 right-2.5 bg-black/80 backdrop-blur-md text-white text-[10px] font-black px-2 py-0.5 rounded-lg flex items-center gap-1.5 z-20 shadow-md border border-white/20 select-none">' + badgeItems.join('<span class="text-white/30 text-[9px]">|</span>') + '</div>' 
                    : '';
                
                const yearInfo = extractYearAndDate(item);
                const displayYearStr = yearInfo.isUpcoming ? '待播' : (yearInfo.year > 0 ? yearInfo.year : '');
                const yearBadge = displayYearStr ? '<div class="absolute bottom-2.5 left-2.5 ' + (yearInfo.isUpcoming ? 'bg-purple-600/90' : 'bg-blue-600/90') + ' text-white text-[10px] md:text-xs font-black px-1.5 py-0.5 rounded-md flex items-center z-20 shadow-sm border border-white/20">' + displayYearStr + '</div>' : '';
                
                const posterSource = item.poster_source || 'auto';
                const noLogoSource = item.no_logo_poster_source || 'auto';
                const thumbSource = item.thumb_source || 'auto';
                const logoSource = item.logo_source || 'auto';

                const btnBase = "py-1.5 px-1 rounded-xl text-[10px] md:text-[11px] font-black text-white flex items-center justify-center gap-0.5 truncate border border-white/20 shadow-md transition-all duration-150 hover:scale-105 active:scale-95 select-none";

                const noLogoBtnBg = noLogoSource === 'manual' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-purple-600 hover:bg-purple-500';
                const noLogoTick = noLogoSource === 'manual' ? '✅' : '☑️';

                const thumbBtnBg = thumbSource === 'manual' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-purple-600 hover:bg-purple-500';
                const thumbTick = thumbSource === 'manual' ? '✅' : '☑️';

                const posterBtnBg = posterSource === 'manual' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-purple-600 hover:bg-purple-500';
                const posterTick = posterSource === 'manual' ? '✅' : '☑️';

                const logoBtnBg = logoSource === 'manual' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-purple-600 hover:bg-purple-500';
                const logoTick = logoSource === 'manual' ? '✅' : '☑️';

                const actionBtns = '<div class="grid grid-cols-2 gap-1.5 w-full pt-2 border-t border-gray-100 dark:border-zinc-700/60 mt-auto shrink-0">' +
                    '<button onclick="openCleanPosterSelector(event, \\'' + item.tmdbId + '\\', \\'' + safeTitle + '\\', \\'' + (item.noLogoPoster || '') + '\\', \\'' + noLogoSource + '\\', \\'' + mType + '\\')" class="' + noLogoBtnBg + ' ' + btnBase + '" title="手动选轮播海报（纯净无字版）">轮播 ' + noLogoTick + '</button>' +
                    '<button onclick="openThumbSelector(event, \\'' + item.tmdbId + '\\', \\'' + safeTitle + '\\', \\'' + (item.thumb || '') + '\\', \\'' + thumbSource + '\\', \\'' + mType + '\\')" class="' + thumbBtnBg + ' ' + btnBase + '" title="手动选剧照/横版背景">剧照 ' + thumbTick + '</button>' +
                    '<button onclick="openPosterSelector(event, \\'' + item.tmdbId + '\\', \\'' + safeTitle + '\\', \\'' + (item.poster_path || '') + '\\', \\'' + posterSource + '\\', \\'' + mType + '\\')" class="' + posterBtnBg + ' ' + btnBase + '" title="手动选竖版正标海报（带官方艺术字）">竖 ' + posterTick + '</button>' +
                    '<button onclick="openLogoSelector(event, \\'' + item.tmdbId + '\\', \\'' + safeTitle + '\\', \\'' + (item.logo || '') + '\\', \\'' + logoSource + '\\', \\'' + mType + '\\')" class="' + logoBtnBg + ' ' + btnBase + '" title="手动选透明Logo">标 ' + logoTick + '</button>' +
                '</div>';

                const cardHtml = '<div class="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md transform-gpu border border-white/60 dark:border-zinc-700/60 rounded-2xl md:rounded-[1.5rem] shadow-sm relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl group flex flex-col h-full cursor-pointer" onclick="const cb = this.querySelector(\\'.logo-checkbox\\'); if(cb) { cb.checked = !cb.checked; updateLogoToolbar(); }">' +
                        '<div class="relative w-full pt-[150%] overflow-hidden rounded-t-2xl md:rounded-t-[1.5rem] bg-gray-200 dark:bg-zinc-700 shrink-0">' +
                            '<img src="' + posterUrl + '" loading="lazy" decoding="async" onerror="this.src=\\'https://via.placeholder.com/500x750?text=No+Poster\\'" alt="' + item.title + '" class="absolute top-0 left-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 md:opacity-100">' +
                            checkboxHtml + ' ' + actionControlBtns + ' ' + ratingBadge + ' ' + yearBadge +
                        '</div>' +
                        '<div class="p-2.5 md:p-3.5 flex-1 flex flex-col justify-between gap-1.5">' +
                            '<h3 class="font-black text-gray-800 dark:text-white text-xs md:text-sm line-clamp-1 leading-snug" title="' + safeTitle + '">' + item.title + '</h3>' +
                            actionBtns +
                        '</div>' +
                    '</div>';

                grid.insertAdjacentHTML('beforeend', cardHtml);
            });

            if (pendingCheckedIds.length > 0) { 
                document.querySelectorAll('.logo-checkbox').forEach(cb => { 
                    if (pendingCheckedIds.includes(cb.value)) cb.checked = true; 
                }); 
            }
            updateLogoToolbar();
        }

        const TITLE_TRANSLATIONS = {
            "home.continue_watching": { en: "Continue Watching", zh: "继续观看", "zh-Hant": "繼續觀看", ja: "続きを見る", es: "Continuar Viendo", ar: "متابعة المشاهدة" },
            "home.tmdb_popular_tv_shows": { en: "Popular TV Shows", zh: "今日热门电视剧", "zh-Hant": "今日熱門電視劇", ja: "人気のテレビ番組", es: "Series Populares", ar: "مسلسلات شهيرة" },
            "home.tmdb_popular_movies": { en: "Popular Movies", zh: "今日热门电影", "zh-Hant": "今日熱門電影", ja: "人気の映画", es: "Películas Populares", ar: "أفلام شهيرة" },
            "home.popular_domestic_anime": { en: "Popular Domestic Anime", zh: "热门国产动漫", "zh-Hant": "熱門國產動漫", ja: "人気の国産アニメ", es: "Anime Doméstico Popular", ar: "أنمي محلي شهير" },
            "home.bangumi_popular_anime": { en: "Trending Anime", zh: "今日热门番剧", "zh-Hant": "今日熱門新番", ja: "注目のアニメ", es: "Anime en Tendencia", ar: "أنمي رائج" },
            "home.tmdb_on_the_air_tv_shows": { en: "TV Shows On The Air", zh: "正在热播电视剧", "zh-Hant": "現正播出電視劇", ja: "放送中のテレビ番組", es: "Series al Aire", ar: "مسلسلات تُعرض حالياً" },
            "home.popular_tv_shows": { en: "Popular Chinese TV Shows", zh: "时下热门国产剧", "zh-Hant": "時下熱門國產劇", ja: "中国ドラマ", es: "Dramas Populares", ar: "مسلسلات صينية شهيرة" },
            "home.popular_movies": { en: "Popular Chinese Movies", zh: "实时热门电影", "zh-Hant": "實時熱門電影", ja: "人気の中国映画", es: "Películas Populares", ar: "أفلام صينية شهيرة" },
            "home.popular_variety_shows": { en: "Popular Variety Shows", zh: "热门综艺", "zh-Hant": "熱門綜藝", ja: "人気のバラエティ", es: "Programas de Variedades", ar: "برامج منوعة شهيرة" },
            "home.popular_korean_tv_shows": { en: "Popular Korean Dramas", zh: "备受欢迎的韩剧推荐", "zh-Hant": "備受歡迎的韓劇推薦", ja: "人気の韓国ドラマ", es: "Dramas Coreanos Populares", ar: "مسلسلات كورية شهيرة" },
            "home.popular_japanese_tv_shows": { en: "Popular Japanese TV Shows", zh: "细腻又治愈的高人气日剧", "zh-Hant": "細膩又治癒的高人氣日劇", ja: "人気の国内ドラマ", es: "Dramas Japoneses Populares", ar: "مسلسلات يابانية شهيرة" },
            "home.popular_spanish_tv_shows": { en: "Popular Spanish TV Shows", zh: "时下流行的西语剧集", "zh-Hant": "時下流行的西語剧集", ja: "人気のスペイン語ドラマ", es: "Series en Español Populares", ar: "مسلسلات إسبانية شهيرة" },
            "home.popular_taiwanese_tv_shows": { en: "Popular Taiwanese TV Shows", zh: "台剧当然也不能落下", "zh-Hant": "台劇當然也不能落下", ja: "人気の台湾ドラマ", es: "Series Taiwanesas Populares", ar: "مسلسلات تايوانية شهيرة" },
            "home.popular_taiwanese_movies": { en: "Popular Taiwanese Movies", zh: "台味浓浓的宝藏台片", "zh-Hant": "台味濃濃的寶藏台片", ja: "人気の台湾映画", es: "Películas Taiwanesas Populares", ar: "أفلام تايوانية شهيرة" },
            "home.weekly_anime": { en: "Weekly Anime", zh: "动漫新番周更表", "zh-Hant": "動漫新番週更表", ja: "アニメ週間更新", es: "Anime Semanal", ar: "أنمي أسبوعي" },
            "home.weekly_drama": { en: "Weekly Chinese Dramas", zh: "国产追剧周更表", "zh-Hant": "國產追劇週更表", ja: "中国ドラマ週間更新", es: "Dramas Semanales", ar: "دراما صينية أسبوعية" },
            "home.weekly_guoman": { en: "Weekly Domestic Anime", zh: "国漫追番周历表", "zh-Hant": "國漫追番週歷表", ja: "国漫週間更新", es: "Animación China Semanal", ar: "أنمي صيني أسبوعي" },
            "home.weekly_korean_drama": { en: "Weekly Korean Dramas", zh: "韩剧追剧周更表", "zh-Hant": "韓劇追劇週更表", ja: "韓国ドラマ週間更新", es: "Dramas Coreanos Semanales", ar: "دراما كورية أسبوعية" },
            "home.weekly_japanese_drama": { en: "Weekly Japanese Dramas", zh: "日剧追剧周更表", "zh-Hant": "日劇追劇週更表", ja: "日本ドラマ週間更新", es: "Dramas Japoneses Semanales", ar: "دراما يابانية أسبوعية" },
            "home.weekly_sea_drama": { en: "Weekly Southeast Asian Dramas", zh: "东南亚剧周更表", "zh-Hant": "東南亞劇週更表", ja: "東南アジアドラマ週間更新", es: "Dramas del Sudeste Asiático Semanales", ar: "دراما جنوب شرق آسيا" },
            "home.tmdb_tv_netflix": { en: "Netflix Popular TV", zh: "Netflix 全球热播好剧", "zh-Hant": "Netflix 全球熱播好劇", ja: "Netflix 人気ドラマ", es: "Series Populares de Netflix", ar: "مسلسلات نتفليكس الشهيرة" },
            "home.variety_cn": { en: "Chinese Variety Shows", zh: "热门国产综艺", "zh-Hant": "熱門國產綜藝", ja: "人気の中国バラエティ", es: "Variedades Chinas Populares", ar: "برامج منوعة صينية" },
            "home.variety_kr": { en: "Korean Variety Shows", zh: "爆款韩国综艺", "zh-Hant": "爆款韓國綜藝", ja: "人気の韓国バラエティ", es: "Variedades Coreanas Populares", ar: "برامج منوعة كورية" },
            "home.variety_global": { en: "Global Streaming Variety Shows", zh: "全球流媒体新热综艺", "zh-Hant": "全球串流新熱綜藝", ja: "グローバルバラエティ", es: "Variedades Globales", ar: "برامج منوعة عالمية" },
            "home.tmdb_tv_hbo": { en: "HBO High-Rated TV Shows", zh: "HBO 高分神剧", "zh-Hant": "HBO 高分神劇", ja: "HBO 名作ドラマ", es: "Series de HBO", ar: "مسلسلات HBO" },
            "home.tmdb_tv_apple": { en: "Apple TV+ Originals", zh: "Apple TV+ 原创精品", "zh-Hant": "Apple TV+ 原創精品", ja: "Apple TV+ オリジナル", es: "Originales de Apple TV+", ar: "أعمال Apple TV+ الأصلية" },
            "home.trakt_movies": { en: "Trakt Blockbuster Movies", zh: "火爆全球欧美大片", "zh-Hant": "火爆全球歐美大片", ja: "大ヒット映画", es: "Películas Populares de Trakt", ar: "أفلام رائجة" },
            "home.trakt_shows": { en: "Trakt Popular TV Shows", zh: "时下热播欧美剧集", "zh-Hant": "時下熱播歐美劇集", ja: "海外人気ドラマ", es: "Series Populares de Trakt", ar: "مسلسلات رائجة" },
            "home.tmdb_anime_jp": { en: "Recent Popular Anime", zh: "近期热门日本动漫", "zh-Hant": "近期熱門日本動漫", ja: "最近人気の日本アニメ", es: "Anime Japonés Popular", ar: "أنمي ياباني شهير" },
            "home.imdb_top_anime": { en: "IMDb Top Anime", zh: "IMDb 史诗动漫神作", "zh-Hant": "IMDb 史詩動漫神作", ja: "IMDb 高評価アニメ", es: "Anime Mejor Valorado IMDb", ar: "أفضل أنمي حسب IMDb" },
            "home.prime_hot_anime": { en: "Prime Video Hot Anime", zh: "Prime Video 热门日漫", "zh-Hant": "Prime Video 熱門日漫", ja: "Prime Video 人気アニメ", es: "Anime Popular de Prime Video", ar: "أنمي برايم فيديو الشهير" },
            "home.filmarks_anime_movie": { en: "Filmarks Anime Movies", zh: "Filmarks 高分剧场版", "zh-Hant": "Filmarks 高分劇場版", ja: "Filmarks 高評価アニメ映画", es: "Películas de Anime Filmarks", ar: "أفلام أنمي Filmarks" },
            "home.netflix_hot_anime": { en: "Netflix Exclusive Anime", zh: "Netflix 独播霸榜日漫", "zh-Hant": "Netflix 獨播霸榜日漫", ja: "Netflix 人気アニメ", es: "Anime Exclusivo de Netflix", ar: "أنمي نتفليكس الحصري" },
            "home.tmdb_anime_top_ja": { en: "TMDB Top Rated Anime", zh: "TMDB 高分神作日漫", "zh-Hant": "TMDB 高分神作日漫", ja: "TMDB 高評価アニメ", es: "Anime Mejor Valorado TMDB", ar: "أفضل أنمي حسب TMDB" },
            "home.tmdb_anime_movie_ja": { en: "Acclaimed Anime Movies", zh: "备受好评的动画电影", "zh-Hant": "備受好評的動畫電影", ja: "名作アニメ映画", es: "Películas de Anime Aclamadas", ar: "أفلام أنمي مميزة" },
            "home.tmdb_movie_sea": { en: "Southeast Asian Passion Movies", zh: "荷尔模超标的东南亚", "zh-Hant": "荷爾蒙超標的東南亞", ja: "東南アジア映画", es: "Películas del Sudeste Asiático", ar: "أفلام جنوب شرق آسيا" },
            "home.tmdb_movie_hk_erotic_comedy": { en: "Hong Kong Classic Comedies", zh: "港产经典风月喜剧", "zh-Hant": "港產經典風月喜劇", ja: "香港クラシックコメディ", es: "Comedias Clásicas de Hong Kong", ar: "كوميديا هونغ كونغ الكلاسيكية" },
            "home.tmdb_tv_th": { en: "Popular Thai Dramas", zh: "狗血上头的爆款泰剧", "zh-Hant": "狗血上頭的爆款泰劇", ja: "人気のタイドラマ", es: "Dramas Tailandeses Populares", ar: "مسلسلات تايلاندية شهيرة" },
            "home.tmdb_movie_th": { en: "Thai Movies Selection", zh: "不止鬼片的泰国电影", "zh-Hant": "不止鬼片的泰國電影", ja: "タイ映画コレクション", es: "Películas Tailandesas", ar: "أفلام تايلاندية" },
            "home.tmdb_tv_bl": { en: "Ultimate Asian BL Dramas", zh: "暧昧拉扯到极致的亚洲耽美神作", "zh-Hant": "曖昧拉扯到極致的亞洲耽美神作", ja: "アジアのBLドラマ名作", es: "Dramas BL Asiáticos", ar: "دراما آسيوية مميزة" },
            "home.netflix_minor_tv_shows": { en: "Netflix Minor Language Shows", zh: "Netflix 小语种神剧", "zh-Hant": "Netflix 小語種神劇", ja: "Netflix マイナー言語ドラマ", es: "Series de Netflix en Otros Idiomas", ar: "مسلسلات نتفليكس بلغات أخرى" },
            "home.netflix_minor_movies": { en: "Hidden Gem Minor Language Movies", zh: "冷门却惊艳的小语种电影", "zh-Hant": "冷門卻驚豔的小語種電影", ja: "隠れた名作外国映画", es: "Películas Sorprendentes en Otros Idiomas", ar: "أفلام بلغات أخرى" }
        };

        const TMDB_LIST_ROUTE_PARAMS = {
            "tmdb_popular_movies": { category: "trending", type: "movie" },
            "tmdb_popular_tv": { category: "trending", type: "tv" },
            "tmdb_tv_netflix": { category: "discover", type: "tv", network: "213", networkName: "Netflix" },
            "tmdb_tv_hbo": { category: "discover", type: "tv", network: "49", networkName: "HBO" },
            "tmdb_tv_apple": { category: "discover", type: "tv", network: "2552", networkName: "Apple TV+" },
            "tmdb_tv_ja": { category: "discover", type: "tv", language: "ja" },
            "tmdb_tv_es": { category: "discover", type: "tv", language: "es" },
            "tmdb_tv_th": { category: "discover", type: "tv", language: "th" },
            "tmdb_movie_th": { category: "discover", type: "movie", language: "th" },
            "tmdb_anime_jp": { category: "discover", type: "tv", genre: "16", language: "ja" },
            "tmdb_anime_cn": { category: "discover", type: "tv", genre: "16", language: "zh" }
        };

        function toggleAllLayout(check) {
            document.querySelectorAll('.layout-cb').forEach(cb => {
                cb.checked = check;
                if (modalLayoutState[cb.value]) {
                    modalLayoutState[cb.value].checked = check;
                }
            });
        }

        function openLayoutModal() {
            initCategoryOrder();
            modalLayoutState = JSON.parse(localStorage.getItem('saved_layout_v2') || '{}');
            CATEGORIES.forEach(c => { if (typeof modalLayoutState[c.id] === 'undefined') { modalLayoutState[c.id] = { checked: true, preset: c.preset, sort: 'default' }; } });
            renderLayoutModal(); document.getElementById('layout-modal').classList.remove('hidden');
        }

        // 🌟 2. 修改排版弹窗下拉选项：只保留 V2 客户端合法支持的预设，并自动把历史 thumb-list 映射至 poster-list
        function renderLayoutModal() {
            const container = document.getElementById('layout-checkboxes'); container.innerHTML = '';
            categoryOrder.forEach((id, index) => {
                const c = CATEGORIES.find(cat => cat.id === id); if (!c) return;
                const state = modalLayoutState[c.id];
                const card = '<div class="flex items-center justify-between py-3 md:py-4 px-2 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors border-b border-gray-100 dark:border-zinc-800/60 draggable-item bg-white dark:bg-zinc-900" ' +
                     'draggable="true" data-index="' + index + '" ondragstart="handleDragStart(event)" ondragover="handleDragOver(event)" ondrop="handleDrop(event)" ondragenter="handleDragEnter(event)" ondragleave="handleDragLeave(event)">' +
                    '<div class="flex flex-col gap-1 mr-2 md:hidden">' +
                        '<button onclick="moveCategory(' + index + ', -1)" class="text-gray-400 hover:text-blue-500 bg-gray-100 dark:bg-zinc-800 rounded p-1"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 15l7-7 7 7"></path></svg></button>' +
                        '<button onclick="moveCategory(' + index + ', 1)" class="text-gray-400 hover:text-blue-500 bg-gray-100 dark:bg-zinc-800 rounded p-1"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"></path></svg></button>' +
                    '</div>' +
                    '<div class="cursor-grab text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 active:cursor-grabbing px-2 hidden md:block">' +
                        '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"></path></svg>' +
                    '</div>' +
                    '<label class="flex items-center gap-3 cursor-pointer flex-1 overflow-hidden pr-2">' +
                        '<input type="checkbox" value="' + c.id + '" class="layout-cb w-5 h-5 accent-blue-600 shrink-0" ' + (state.checked ? 'checked' : '') + ' onchange="modalLayoutState[\\'' + c.id + '\\'].checked = this.checked">' +
                        '<span class="text-sm font-bold text-gray-800 dark:text-gray-200 truncate select-none">' + c.name + '</span>' +
                    '</label>' +
                    '<div class="shrink-0 flex items-center gap-1.5 md:gap-2">' +
                        '<select class="text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-2 py-1.5 outline-none font-bold text-gray-600 dark:text-gray-300 shadow-sm cursor-pointer focus:border-blue-500" onchange="modalLayoutState[\\'' + c.id + '\\'].preset = this.value">' +
                            '<option value="poster-list" ' + ((state.preset === 'poster-list' || state.preset === 'thumb-list') ? 'selected' : '') + '>竖版海报</option>' +
                            '<option value="hero-list" ' + (state.preset === 'hero-list' ? 'selected' : '') + '>精选大图 (精选卡片)</option>' +
                            (c.isCollection ? '<option value="collection-list" selected>新番日历合集</option>' : '') +
                        '</select>' +
                        (c.isStatic || c.isCollection ? '' : '<select class="text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-2 py-1.5 outline-none font-bold text-indigo-600 dark:text-indigo-400 shadow-sm cursor-pointer focus:border-indigo-500" onchange="updateSortAndRender(\\'' + c.id + '\\', this.value)">' +
                            '<option value="default" ' + (state.sort === 'default' ? 'selected' : '') + '>默认</option>' +
                            '<option value="year" ' + (state.sort === 'year' ? 'selected' : '') + '>最新</option>' +
                            '<option value="heat" ' + (state.sort === 'heat' ? 'selected' : '') + '>热度</option>' +
                        '</select>') +
                    '</div>' +
                '</div>';
                container.innerHTML += card;
            });
        }

        // 🌟 3. 修改前端 TS 代码生成器：强制加上防 thumb-list 过滤锁
        function generateTSCode() {
            localStorage.setItem('saved_layout_v2', JSON.stringify(modalLayoutState));
            const selectedCats = [];
            
            categoryOrder.forEach(id => {
                const c = CATEGORIES.find(cat => cat.id === id);
                if (c && modalLayoutState[c.id] && modalLayoutState[c.id].checked) { 
                    const catInfo = { ...c }; 
                    catInfo.currentPreset = modalLayoutState[c.id].preset || c.preset; 
                    catInfo.sort = modalLayoutState[c.id].sort || 'default';
                    selectedCats.push(catInfo); 
                }
            });
            
            const myR2 = "https://r2.eplayerx.cc.cd";
            const weekdays = ["一", "二", "三", "四", "五", "六", "日"];
            
            let customBlocks = selectedCats.map(c => {
                const catCfg = CATEGORY_CONFIGS.find(cfg => cfg.id === c.id);
                const fileName = catCfg ? catCfg.fileName : (c.id + '.json');
                
                // 🌟 核心防错锁：只要不是 hero-list，全部强制设为 poster-list，绝不输出 thumb-list！
                const safePreset = (c.currentPreset === 'hero-list') ? 'hero-list' : 'poster-list';

                if (c.isCollection) {
                    // 🌟 自动剥离国旗 Emoji 以及 (合集) 后缀
                    const cleanTitle = (c.name || '').replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF]/g, '').replace(/\s*[(（].*?[)）]\s*/g, '').trim();
                    const childrenStr = [1, 2, 3, 4, 5, 6, 7].map(d => {
                        return '        {\\n' +
                               '          id: "' + c.id + '-' + d + '",\\n' +
                               '          label: "周' + weekdays[d - 1] + '",\\n' +
                               '          weekday: ' + d + ',\\n' +
                               '          title: "周' + weekdays[d - 1] + '",\\n' +
                               '          mediaType: "' + c.type + '",\\n' +
                               '          preset: "poster-list",\\n' +
                               '          source: { path: "' + myR2 + '/' + c.id + '-' + d + '.json", itemEnvelope: "data" }\\n' +
                               '        }';
                    }).join(',\\n');

                    return '    {\\n' +
                           '      id: "' + c.id + '",\\n' +
                           '      title: "' + cleanTitle + '",\\n' +
                           '      mediaType: "' + c.type + '",\\n' +
                           '      preset: COLLECTION_PRESET,\\n' +
                           '      style: "image-landscape",\\n' +
                           '      groupMode: "weekday",\\n' +
                           '      children: [\\n' +
                           childrenStr + '\\n' +
                           '      ]\\n' +
                           '    } as unknown as HomeBlockTemplate';
                }
                return '    {\\n' +
                       '      id: "' + c.id + '",\\n' +
                       '      mediaType: "' + c.type + '",\\n' +
                       '      titleKey: "' + c.titleKey + '",\\n' +
                       '      preset: "' + safePreset + '",\\n' +
                       '      showRank: true,\\n' +
                       '      showOverview: true,\\n' +
                       '      source: { path: "' + myR2 + '/' + fileName + '", itemEnvelope: "data" }\\n' +
                       '    }';
            }).join(',\\n');

            return '/// <reference types="@cloudflare/workers-types" />\\n' +
                'import { getCommunityBlocksByIds } from "../blocks/storage.js";\\n' +
                'import {\\n' +
                '  COLLECTION_PRESET,\\n' +
                '  type CollectionBlock,\\n' +
                '  type TmdbListRoute,\\n' +
                '} from "../blocks/types.js";\\n\\n' +
                'type Locale = "en" | "zh" | "zh-Hant" | "ja" | "es" | "ar";\\n\\n' +
                'type HomeTitleKey =\\n' +
                '  | "home.continue_watching"\\n' +
                '  | "home.tmdb_popular_tv_shows"\\n' +
                '  | "home.tmdb_popular_movies"\\n' +
                '  | "home.popular_domestic_anime"\\n' +
                '  | "home.bangumi_popular_anime"\\n' +
                '  | "home.tmdb_on_the_air_tv_shows"\\n' +
                '  | "home.popular_tv_shows"\\n' +
                '  | "home.popular_movies"\\n' +
                '  | "home.popular_variety_shows"\\n' +
                '  | "home.popular_korean_tv_shows"\\n' +
                '  | "home.popular_japanese_tv_shows"\\n' +
                '  | "home.popular_spanish_tv_shows"\\n' +
                '  | "home.popular_taiwanese_tv_shows"\\n' +
                '  | "home.popular_taiwanese_movies"\\n' +
                '  | "home.tmdb_discover_genres"\\n' +
                '  | "home.tmdb_discover_languages"\\n' +
                '  | "home.tmdb_discover_networks"\\n' +
                '  | "home.classic_decades"\\n' +
                '  | "home.tmdb_top_rated_movies"\\n' +
                '  | "home.tmdb_top_rated_tv_shows"\\n' +
                '  | "home.weekly_anime"\\n' +
                '  | "home.weekly_drama"\\n' +
                '  | "home.weekly_guoman"\\n' +
                '  | "home.weekly_korean_drama"\\n' +
                '  | "home.weekly_japanese_drama"\\n' +
                '  | "home.weekly_sea_drama"\\n' +
                '  | "home.tmdb_tv_netflix"\\n' +
                '  | "home.variety_cn"\\n' +
                '  | "home.variety_kr"\\n' +
                '  | "home.variety_global"\\n' +
                '  | "home.tmdb_tv_hbo"\\n' +
                '  | "home.tmdb_tv_apple"\\n' +
                '  | "home.trakt_movies"\\n' +
                '  | "home.trakt_shows"\\n' +
                '  | "home.tmdb_anime_jp"\\n' +
                '  | "home.imdb_top_anime"\\n' +
                '  | "home.prime_hot_anime"\\n' +
                '  | "home.filmarks_anime_movie"\\n' +
                '  | "home.netflix_hot_anime"\\n' +
                '  | "home.tmdb_anime_top_ja"\\n' +
                '  | "home.tmdb_anime_movie_ja"\\n' +
                '  | "home.tmdb_movie_sea"\\n' +
                '  | "home.tmdb_movie_hk_erotic_comedy"\\n' +
                '  | "home.tmdb_tv_th"\\n' +
                '  | "home.tmdb_movie_th"\\n' +
                '  | "home.tmdb_tv_bl"\\n' +
                '  | "home.netflix_minor_tv_shows"\\n' +
                '  | "home.netflix_minor_movies";\\n\\n' +
                'type SourceQueryValue = string | number | boolean;\\n\\n' +
                'interface HomePagination {\\n' +
                '  pageParam: string;\\n' +
                '  startPage: number;\\n' +
                '}\\n\\n' +
                'interface HomeBlockSource {\\n' +
                '  id?: string;\\n' +
                '  path?: string;\\n' +
                '  query?: Record<string, SourceQueryValue>;\\n' +
                '  itemEnvelope?: "data" | "results" | "array";\\n' +
                '  pagination?: HomePagination;\\n' +
                '}\\n\\n' +
                'export interface HomeConfigV2MediaBlock {\\n' +
                '  id: string;\\n' +
                '  title?: string;\\n' +
                '  mediaType?: "movie" | "tv";\\n' +
                '  preset: string;\\n' +
                '  showRank?: boolean;\\n' +
                '  showOverview?: boolean;\\n' +
                '  source?: HomeBlockSource;\\n' +
                '  metadata?: {\\n' +
                '    isAnime?: boolean;\\n' +
                '  };\\n' +
                '  route?: TmdbListRoute;\\n' +
                '}\\n\\n' +
                'export type HomeConfigV2Block = HomeConfigV2MediaBlock | CollectionBlock;\\n\\n' +
                'type TmdbListRouteParams = TmdbListRoute["params"];\\n\\n' +
                'type HomeBlockTemplate = Omit<HomeConfigV2MediaBlock, "title"> & {\\n' +
                '  titleKey?: HomeTitleKey;\\n' +
                '  title?: string;\\n' +
                '  groupMode?: string;\\n' +
                '  style?: string;\\n' +
                '  sort?: string;\\n' +
                '  children?: any[];\\n' +
                '};\\n\\n' +
                'type DecadesCollectionSlot = { type: "decades-collection" };\\n\\n' +
                'type V2Section = HomeBlockTemplate | DecadesCollectionSlot;\\n\\n' +
                'export interface HomeConfigV2Options {\\n' +
                '  apiBaseUrl: string;\\n' +
                '  imageBaseUrl: string;\\n' +
                '  language: string;\\n' +
                '  timezone: string;\\n' +
                '  db?: D1Database;\\n' +
                '}\\n\\n' +
                'export interface HomeConfigV2 {\\n' +
                '  version: number;\\n' +
                '  apiBaseUrl: string;\\n' +
                '  imageBaseUrl: string;\\n' +
                '  carouselSourceId: string;\\n' +
                '  blocks: HomeConfigV2Block[];\\n' +
                '}\\n\\n' +
                'export const HOME_CONFIG_V2_VERSION = 2;\\n\\n' +
                'const TITLE_TRANSLATIONS: Record<string, Record<Locale, string>> = ' + JSON.stringify(TITLE_TRANSLATIONS, null, 2) + ';\\n\\n' +
                'const TMDB_LIST_ROUTE_PARAMS: Partial<Record<string, TmdbListRouteParams>> = ' + JSON.stringify(TMDB_LIST_ROUTE_PARAMS, null, 2) + ';\\n\\n' +
                'const DECADES_COLLECTION_ID = "col-9e37cdc1f13d";\\n\\n' +
                'function resolveLocale(language: string): Locale {\\n' +
                '  const normalized = (language || "").toLowerCase();\\n' +
                '  if (normalized.startsWith("zh-hant") || normalized.includes("tw") || normalized.includes("hk")) return "zh-Hant";\\n' +
                '  if (normalized.startsWith("zh")) return "zh";\\n' +
                '  if (normalized.startsWith("ja")) return "ja";\\n' +
                '  if (normalized.startsWith("es")) return "es";\\n' +
                '  if (normalized.startsWith("ar")) return "ar";\\n' +
                '  return "en";\\n' +
                '}\\n\\n' +
                'function resolveTitle(titleKey: string, language: string): string {\\n' +
                '  if (!titleKey) return "";\\n' +
                '  const trans = TITLE_TRANSLATIONS[titleKey];\\n' +
                '  if (!trans) return titleKey;\\n' +
                '  return trans[resolveLocale(language)] || trans["zh"] || trans["en"] || titleKey;\\n' +
                '}\\n\\n' +
                'function createTmdbListRoute(title: string, params: TmdbListRouteParams): TmdbListRoute {\\n' +
                '  return { type: "tmdb-list", title, params };\\n' +
                '}\\n\\n' +
                'function isDecadesCollectionSlot(section: V2Section): section is DecadesCollectionSlot {\\n' +
                '  return "type" in section && section.type === "decades-collection";\\n' +
                '}\\n\\n' +
                'function createV2BlockTemplates(language: string, timezone: string): V2Section[] {\\n' +
                '  const chineseOnly = (language || "").toLowerCase().startsWith("zh");\\n' +
                '  const doubanHeadBlocks: V2Section[] = chineseOnly ? [\\n' +
                '    { id: "douban-popular-tv-shows", mediaType: "tv", titleKey: "home.popular_tv_shows", preset: "poster-list", showRank: true, source: { path: "/crawler/popular/douban/tv", query: { language }, itemEnvelope: "data" } },\\n' +
                '    { id: "douban-popular-movies", mediaType: "movie", titleKey: "home.popular_movies", preset: "poster-list", showRank: true, source: { path: "/crawler/popular/douban/movies", itemEnvelope: "data" } }\\n' +
                '  ] : [];\\n\\n' +
                '  const chineseAnimeBlocks: V2Section[] = chineseOnly ? [\\n' +
                '    { id: "douban-popular-anime", mediaType: "tv", titleKey: "home.popular_domestic_anime", preset: "poster-list", showRank: true, source: { path: "/crawler/popular/douban/animation", query: { language }, itemEnvelope: "data" }, metadata: { isAnime: true } },\\n' +
                '    { id: "bangumi-popular-anime", mediaType: "tv", titleKey: "home.bangumi_popular_anime", preset: "poster-list", showRank: true, source: { path: "/crawler/popular/bangumi/animation", query: { language }, itemEnvelope: "data" }, metadata: { isAnime: true } }\\n' +
                '  ] : [];\\n\\n' +
                '  return [\\n' +
                '    ...doubanHeadBlocks,\\n' +
                '    { id: "tmdb-discover-genres", titleKey: "home.tmdb_discover_genres", preset: "genres-list", source: { path: "/crawler/discover/genres", query: { language }, itemEnvelope: "data" } },\\n' +
                '    { type: "decades-collection" },\\n' +
                '    { id: "tmdb-discover-networks", titleKey: "home.tmdb_discover_networks", preset: "networks-list", source: { path: "/crawler/discover/tv-by-network", itemEnvelope: "data" } },\\n' +
                '    { id: "tmdb-discover-tv-by-language", titleKey: "home.tmdb_discover_languages", preset: "languages-list", source: { path: "https://api.eplayerx.com/crawler/discover/tv-by-language/v2", query: { language }, itemEnvelope: "data" } },\\n' +
                '    { id: "tmdb-on-the-air-tv-shows", mediaType: "tv", titleKey: "home.tmdb_on_the_air_tv_shows", preset: "hero-list", source: { path: "/tmdb/tv/on_the_air", query: { language, timezone }, itemEnvelope: "results" } },\\n' +
                '    ...chineseAnimeBlocks,\\n' +
                '    { id: "tmdb-top-rated-movies", titleKey: "home.tmdb_top_rated_movies", mediaType: "movie", preset: "poster-list", source: { path: "/tmdb/movie/top_rated", query: { language, page: 1, limit: 20 }, itemEnvelope: "results", pagination: { pageParam: "page", startPage: 1 } } },\\n' +
                '    { id: "tmdb-top-rated-tv-shows", titleKey: "home.tmdb_top_rated_tv_shows", mediaType: "tv", preset: "poster-list", source: { path: "/tmdb/tv/top_rated", query: { language, page: 1, limit: 20 }, itemEnvelope: "results", pagination: { pageParam: "page", startPage: 1 } } }' +
                (customBlocks ? ',\\n' + customBlocks : '') + '\\n' +
                '  ];\\n' +
                '}\\n\\n' +
                'function resolveMediaBlock(block: HomeBlockTemplate, language: string): HomeConfigV2MediaBlock {\\n' +
                '  const { titleKey, ...rest } = block;\\n' +
                '  if (!titleKey) return rest as HomeConfigV2MediaBlock;\\n' +
                '  const title = resolveTitle(titleKey, language);\\n' +
                '  const routeParams = TMDB_LIST_ROUTE_PARAMS[rest.id];\\n' +
                '  return { ...rest, title, ...(routeParams ? { route: createTmdbListRoute(title, routeParams) } : {}) } as HomeConfigV2MediaBlock;\\n' +
                '}\\n\\n' +
                'function parseDecadesCollection(blockId: string, blockJson: string, language: string): CollectionBlock | null {\\n' +
                '  try {\\n' +
                '    const parsed = JSON.parse(blockJson) as CollectionBlock;\\n' +
                '    if (parsed.preset !== COLLECTION_PRESET) return null;\\n' +
                '    if (!Array.isArray(parsed.children) || parsed.children.length < 2) return null;\\n' +
                '    return { ...parsed, id: parsed.id || blockId, title: resolveTitle("home.classic_decades", language), style: "image-landscape" };\\n' +
                '  } catch { return null; }\\n' +
                '}\\n\\n' +
                'async function resolveDecadesCollection(db: D1Database | undefined, language: string): Promise<CollectionBlock | null> {\\n' +
                '  if (!db) return null;\\n' +
                '  try {\\n' +
                '    const rows = await getCommunityBlocksByIds(db, [DECADES_COLLECTION_ID]);\\n' +
                '    const row = rows.get(DECADES_COLLECTION_ID);\\n' +
                '    if (!row) return null;\\n' +
                '    return parseDecadesCollection(DECADES_COLLECTION_ID, row.block_json, language);\\n' +
                '  } catch { return null; }\\n' +
                '}\\n\\n' +
                'export async function createHomeConfigV2(options: HomeConfigV2Options): Promise<HomeConfigV2> {\\n' +
                '  const decades = await resolveDecadesCollection(options.db, options.language);\\n' +
                '  const blocks: HomeConfigV2Block[] = [];\\n' +
                '  for (const section of createV2BlockTemplates(options.language, options.timezone)) {\\n' +
                '    if (isDecadesCollectionSlot(section)) {\\n' +
                '      if (decades) blocks.push(decades);\\n' +
                '      continue;\\n' +
                '    }\\n' +
                '    blocks.push(resolveMediaBlock(section as HomeBlockTemplate, options.language) as HomeConfigV2Block);\\n' +
                '  }\\n' +
                '  return {\\n' +
                '    version: HOME_CONFIG_V2_VERSION,\\n' +
                '    apiBaseUrl: options.apiBaseUrl,\\n' +
                '    imageBaseUrl: options.imageBaseUrl,\\n' +
                '    carouselSourceId: "tmdb_popular_movies",\\n' +
                '    blocks,\\n' +
                '  };\\n' +
                '}';
        }

        function copyGeneratedTS() {
            const code = generateTSCode(); navigator.clipboard.writeText(code).then(() => { showToast("✅ 专属 config.ts 代码已复制到剪贴板！"); closeModal('layout-modal'); }).catch(() => showToast("复制失败", true));
        }

        function preparePushGithub() { closeModal('layout-modal'); openConfirmModal('push-github'); }

        async function runTgWebhook() {
            showToast("⏳ 正在激活 Telegram Webhook...");
            try {
                const res = await fetch(ACTION_BASE + '/tg_webhook', { method: 'POST', headers: { "Authorization": 'Bearer ' + sysPwd } });
                const data = await res.json();
                if (data.success) showToast("🎉 激活成功！去 TG 发送 /start 开始绑定，之后发送 /sync 即可唤出控制台！"); else showToast("❌ 激活失败: " + (data.error || data.desc), true);
            } catch(e) { showToast("❌ 请求异常", true); }
        }

        async function runSyncTask(catId, limit) {
            try {
                const url = ACTION_BASE + '/sync/' + catId + '?limit=' + limit + '&fetch_logo=1&fetch_thumb=1&clear_cooldown=1';
                const res = await fetch(url, { method: 'POST', headers: { "Authorization": 'Bearer ' + sysPwd } });
                const data = await res.json().catch(() => null);
                if (!res.ok) throw new Error((data && data.error) ? data.error : "云端超时或触发限制");
                
                const baseCatId = catId.split('-')[0];
                const catObj = CATEGORIES.find(c => c.id === baseCatId);
                const catName = catObj ? catObj.name : catId;

                if (data && data.success) {
                    const st = data.stats || {};
                    showToast("✅ [" + catName + "] 抓取完毕！共 " + data.count + " 条 (标:" + (st.logos||0) + " | 🎴无字竖:" + (st.noLogoPosters||0) + " | 🎬无字横:" + (st.cleanBackdrops||0) + ")");
                } else showToast("❌ " + catName + " 失败: " + (data ? data.error : '未知错误'), true); 
            } catch (err) { showToast("❌ 同步失败: " + err.message, true); }
        }

        async function executeBatchSync() {
            const checkboxes = document.querySelectorAll('.batch-cb:checked');
            if(checkboxes.length === 0) return showToast("⚠️ 请至少选择一个榜单！", true);
            const limit = parseInt(document.getElementById('batch-limit-select').value, 10);
            
            closeModal('batch-modal'); showToast("🚀 批量同步启动 (" + limit + "条/榜单)，请耐心等待任务逐个完成...");
            let successList = [], failList = [], totalCount = 0;

            for (let cb of checkboxes) {
                const catObj = CATEGORIES.find(c => c.id === cb.value);
                showToast("⏳ 正在抓取: " + catObj.name + " ...");
                try {
                    const url = ACTION_BASE + '/sync/' + catObj.id + '?limit=' + limit + '&fetch_logo=1&fetch_thumb=1&quiet=1';
                    const res = await fetch(url, { method: 'POST', headers: { 'Authorization': 'Bearer ' + sysPwd } });
                    const data = await res.json();
                    if (data.success) {
                        const st = data.stats || {};
                        showToast("✅ [" + catObj.name + "] 同步完毕！共 " + data.count + " 条。");
                        successList.push("▪️ <b>" + catObj.name + "</b> (共" + data.count + "部 | 💎标:<b>" + (st.logos||0) + "</b> | 🎴无字竖:<b>" + (st.noLogoPosters||0) + "</b> | 🎬无字横:<b>" + (st.cleanBackdrops||0) + "</b> | 📇正标:<b>" + (st.posters||0) + "</b>)"); 
                        totalCount += data.count;
                    } else { showToast("❌ " + catObj.name + " 失败: " + data.error, true); failList.push("❌ " + catObj.name + ": " + data.error); }
                } catch(e) { showToast("❌ " + catObj.name + " 失败", true); failList.push("❌ " + catObj.name + ": 网络异常"); }
            }
            showToast("🎉 批量同步队列已全部执行完毕！"); loadData(currentCategory);

            const timeStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
            let tgMsg = "🚀 <b>[网页端批量同步] 执行完毕</b>\\n⏰ 时间: " + timeStr + " UTC\\n\\n";
            if (successList.length > 0) tgMsg += "<b>五维资产入库明细:</b>\\n" + successList.join('\\n') + "\\n";
            if (failList.length > 0) tgMsg += "\\n<b>失败明细:</b>\\n" + failList.join('\\n');
            await fetch(ACTION_BASE + '/tg_notify', { method: 'POST', headers: { "Authorization": 'Bearer ' + sysPwd, "Content-Type": "application/json" }, body: JSON.stringify({ message: tgMsg }) });
        }

        async function runGithubPush() {
            const selectedCats = [];
            categoryOrder.forEach(id => {
                const c = CATEGORIES.find(cat => cat.id === id);
                if (c && modalLayoutState[c.id] && modalLayoutState[c.id].checked) { 
                    const catInfo = { ...c }; 
                    catInfo.currentPreset = modalLayoutState[c.id].preset || c.preset; 
                    catInfo.sort = modalLayoutState[c.id].sort || 'default';
                    selectedCats.push(catInfo); 
                }
            });

            const code = generateTSCode(); 
            showToast("⏳ 正在与 GitHub 通信并执行【增量代码合并】...");
            try {
                const res = await fetch(ACTION_BASE + '/github', { 
                    method: 'POST', 
                    headers: { "Authorization": 'Bearer ' + sysPwd, "Content-Type": "application/json" }, 
                    body: JSON.stringify({ tsCode: code, selectedCats: selectedCats }) 
                });
                const data = await res.json();
                if (data.success) showToast("🎉 增量推送成功！已安全合并入 GitHub config.ts，原有自定义分类完好无损！"); 
                else showToast("❌ GitHub 推送失败: " + data.error, true);
            } catch(e) { showToast("❌ 请求异常", true); }
        }

        async function executeAction() {
            closeModal('confirm-modal');
            if (currentAction === 'sync-single') {
                const limit = parseInt(document.getElementById('sync-limit-select').value, 10);
                
                const catObj = CATEGORIES.find(c => c.id === currentCategory);
                const syncTarget = (catObj && catObj.isCollection) ? currentCategory + '-' + currentWeekday : currentCategory;
                
                showToast("⏳ 正在定向同步前 " + limit + " 部最新影视数据，请稍候...");
                await runSyncTask(syncTarget, limit); 
                loadData(currentCategory);
            } else if (currentAction === 'push-github') { await runGithubPush(); } 
            else if (currentAction === 'tg-webhook') { await runTgWebhook(); }
        }

        function initNav() {
            const pcNav = document.getElementById('pc-nav'); const mobNav = document.getElementById('mob-nav');
            pcNav.innerHTML = ''; mobNav.innerHTML = '';
            categoryOrder.forEach(id => {
                const cat = CATEGORIES.find(c => c.id === id); if (!cat) return;
                
                let colorTheme = cat.isStatic ? 'bg-[#3b82f6]' : 'bg-[#ff6b4a]';
                let shadowTheme = cat.isStatic ? 'shadow-[0_0_8px_rgba(59,130,246,0.8)]' : 'shadow-[0_0_8px_rgba(255,107,74,0.8)]';
                let textColor = cat.isStatic ? 'text-[#3b82f6]' : 'text-[#ff6b4a]';
                
                const pcHtml = '<div onclick="switchCategory(\\'' + cat.id + '\\')" id="pc-nav-' + cat.id + '" class="flex items-center gap-3 text-white px-4 py-3 rounded-2xl cursor-pointer backdrop-blur-sm border transition-colors group ' + (cat.id === currentCategory ? 'bg-white/10 border-white/5' : 'bg-transparent border-transparent hover:bg-white/5') + '">' +
                    '<div class="w-1.5 h-1.5 rounded-full transition-colors ' + (cat.id === currentCategory ? (colorTheme + ' ' + shadowTheme) : 'bg-gray-600 group-hover:bg-gray-400') + '"></div>' +
                    '<span class="font-bold text-xs tracking-wide transition-colors ' + (cat.id === currentCategory ? 'text-white' : 'text-gray-400 group-hover:text-white') + ' truncate pr-2">' + cat.name + '</span>' +
                '</div>';
                pcNav.insertAdjacentHTML('beforeend', pcHtml);

                const mobHtml = '<button onclick="switchCategory(\\'' + cat.id + '\\')" id="mob-nav-' + cat.id + '" class="flex flex-col items-center justify-center gap-1 w-[76px] shrink-0 transition-colors py-1.5 rounded-xl ' + (cat.id === currentCategory ? (textColor + ' bg-white/5') : 'text-gray-400 dark:text-gray-500') + '">' +
                    '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="' + cat.icon + '"></path></svg>' +
                    '<span class="text-[9px] font-bold whitespace-nowrap overflow-hidden text-ellipsis w-full px-1 text-center">' + cat.name + '</span>' +
                '</button>';
                mobNav.insertAdjacentHTML('beforeend', mobHtml);
            });
        }

        async function switchCategory(id) {
            currentCategory = id; 
            const todayDay = new Date().getDay();
            currentWeekday = todayDay === 0 ? 7 : todayDay; 
            pendingCheckedIds = [];
            const catObj = CATEGORIES.find(c => c.id === id);
            document.getElementById('cat-title').innerHTML = catObj.name + '<br>数据大盘';
            
            if(catObj.isStatic) {
                document.getElementById('extract-btn').style.display = 'none';
                document.getElementById('batch-btn').style.display = 'none';
                document.getElementById('sync-btn').style.display = 'none';
            } else {
                document.getElementById('extract-btn').style.display = 'inline-block';
                document.getElementById('batch-btn').style.display = 'inline-block';
                document.getElementById('sync-btn').style.display = 'inline-block';
            }
            
            const isCol = !!(catObj && catObj.isCollection);
            const statusBar = document.getElementById("status-bar-container");
            const slotWeekly = document.getElementById("led-slot-weekly");
            const slotNormal = document.getElementById("led-slot-normal");
            const ledBox = document.getElementById("led-monitor-box");
            const overrideBox = document.getElementById("custom-override-container");

            if (isCol) {
                if (statusBar) {
                    statusBar.classList.remove("hidden");
                    statusBar.classList.add("flex");
                }
                if (slotWeekly && ledBox) slotWeekly.appendChild(ledBox);
                if (overrideBox) {
                    overrideBox.classList.remove("hidden");
                    overrideBox.classList.add("flex");
                }
                if (slotNormal) {
                    slotNormal.classList.remove("flex");
                    slotNormal.classList.add("hidden");
                }
            } else {
                if (statusBar) {
                    statusBar.classList.remove("flex");
                    statusBar.classList.add("hidden");
                }
                if (overrideBox) {
                    overrideBox.classList.remove("flex");
                    overrideBox.classList.add("hidden");
                }
                if (slotNormal && ledBox) {
                    slotNormal.appendChild(ledBox);
                    slotNormal.classList.remove("hidden");
                    slotNormal.classList.add("flex");
                }
            }
            
            CATEGORIES.forEach(cat => {
                const pcBtn = document.getElementById('pc-nav-' + cat.id); const mobBtn = document.getElementById('mob-nav-' + cat.id);
                if (!pcBtn || !mobBtn) return;
                let colorTheme = cat.isStatic ? 'bg-[#3b82f6]' : 'bg-[#ff6b4a]';
                let shadowTheme = cat.isStatic ? 'shadow-[0_0_8px_rgba(59,130,246,0.8)]' : 'shadow-[0_0_8px_rgba(255,107,74,0.8)]';
                let textColor = cat.isStatic ? 'text-[#3b82f6]' : 'text-[#ff6b4a]';
                
                if(cat.id === id) {
                    pcBtn.className = "flex items-center gap-3 text-white bg-white/10 px-4 py-3 rounded-2xl cursor-pointer backdrop-blur-sm border border-white/5 transition-colors group";
                    pcBtn.children[0].className = "w-1.5 h-1.5 rounded-full transition-colors " + colorTheme + " " + shadowTheme;
                    pcBtn.children[1].className = "font-bold text-xs tracking-wide text-white transition-colors truncate pr-2";
                    mobBtn.className = "flex flex-col items-center justify-center gap-1 w-[76px] shrink-0 " + textColor + " bg-gray-100 dark:bg-white/5 transition-colors py-1.5 rounded-xl";
                } else {
                    pcBtn.className = "flex items-center gap-3 text-white bg-transparent px-4 py-3 rounded-2xl cursor-pointer backdrop-blur-sm border border-transparent hover:bg-white/5 transition-colors group";
                    pcBtn.children[0].className = "w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-gray-400 transition-colors";
                    pcBtn.children[1].className = "font-bold text-xs tracking-wide text-gray-400 group-hover:text-white transition-colors truncate pr-2";
                    mobBtn.className = "flex flex-col items-center justify-center gap-1 w-[76px] shrink-0 text-gray-400 dark:text-gray-500 transition-colors py-1.5 rounded-xl";
                }
            });
            await loadData(id);
        }

        async function loadData(category) {
            const grid = document.getElementById("movie-grid");
            const catObj = CATEGORIES.find(c => c.id === category);

            if (catObj && catObj.isStatic) {
                grid.innerHTML = '<div class="col-span-full flex flex-col items-center justify-center py-32"><div class="text-6xl mb-4">📦</div><h3 class="text-2xl font-black text-gray-800 dark:text-white mb-2">播放器原生内置模块</h3><p class="text-gray-500 font-bold text-sm text-center">此模块由原生内置，不依赖云端抓取数据。<br><br>直接点击右上角的<span class="bg-emerald-50 text-emerald-600 px-2 py-1 rounded mx-1">🎨 排版与增量推送</span>将其勾选，拖拉排序后直接生成配置文件即可生效！</p></div>';
                document.getElementById("stat-count").innerText = "-"; 
                document.getElementById("stat-time").innerText = "-";
                window.currentFetchedData = []; 
                const bar = document.getElementById('logo-toolbar'); if(bar) bar.innerHTML = '';
                document.getElementById("weekday-tabs-container").classList.add("hidden");
                return;
            }

            let fetchCategory = category;
            if (catObj && catObj.isCollection) {
                fetchCategory = category + '-' + currentWeekday; 
                
                const tabs = document.getElementById("weekday-tabs-container");
                tabs.classList.remove("hidden");
                tabs.classList.add("flex");
                const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
                const btnsContainer = document.getElementById("weekday-buttons");
                btnsContainer.innerHTML = weekdays.map((w, idx) => {
                    const day = idx === 0 ? 7 : idx; 
                    const isActive = day === currentWeekday;
                    return '<button onclick="currentWeekday=' + day + '; loadData(\\'' + category + '\\')" class="flex-1 py-2 rounded-xl text-xs md:text-sm font-black transition-all ' + (isActive ? 'bg-gradient-to-r from-[#ff6b4a] to-[#e53a1a] text-white shadow-md transform scale-[1.03] animate-[fadeIn_0.2s_ease]' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200') + '">' + w + '</button>';
                }).join("");
            } else {
                document.getElementById("weekday-tabs-container").classList.remove("flex");
                document.getElementById("weekday-tabs-container").classList.add("hidden");
            }

            grid.innerHTML = '<div class="col-span-full text-center py-20"><div class="inline-block w-8 h-8 rounded-full border-4 border-gray-300 dark:border-zinc-700 border-t-[#ff6b4a] animate-spin"></div><p class="mt-4 text-gray-500 font-bold uppercase tracking-widest text-xs">正在读取公共大盘数据...</p></div>';
            document.getElementById("stat-count").innerText = "0"; document.getElementById("stat-time").innerText = "加载中...";

            try {
                let savedV2 = JSON.parse(localStorage.getItem('saved_layout_v2') || '{}');
                let sortType = 'default'; if (savedV2[category] && savedV2[category].sort) sortType = savedV2[category].sort;
                const sortQuery = (sortType && sortType !== 'default') ? '&sort=' + sortType : '';

                const response = await fetch(API_BASE + '/' + fetchCategory + '?_t=' + Date.now() + sortQuery);
                const data = await response.json();
                
                if(!data.data || data.data.length === 0) { 
                    window.currentFetchedData = [];
                    grid.innerHTML = '<div class="col-span-full text-center py-20 text-gray-400 font-bold">大盘暂无数据，请点击更新抓取。</div>'; 
                    const bar = document.getElementById('logo-toolbar'); if(bar) bar.innerHTML = '';
                    return; 
                }
                
                document.getElementById("stat-count").innerText = data.count || 0;
                document.getElementById("stat-time").innerText = data.lastUpdated ? new Date(data.lastUpdated).toLocaleString() : '未知';
                window.currentFetchedData = data.data; renderGrid();

            } catch (error) { grid.innerHTML = '<div class="col-span-full text-center text-red-[#ff4a2b] py-20 font-bold">读取大盘失败</div>'; }
        }
    </script>
</body>
`;
const FRONTEND_HTML_P2 = `</html>
`;
const FRONTEND_HTML = FRONTEND_HTML_P1 + FRONTEND_HTML_P2;

// ==========================================
// 2. 爬虫核心与全局分类字典 (Part 1 引擎配置)
// ==========================================
const CATEGORY_CONFIGS = [
  // === 👇 动态爬虫合集 (包含六大周更表合集) 👇 ===
  { id: "weekly_anime_collection", fileName: "weekly_anime_collection.json", type: "animation", platform: "bangumi", name: "巴哈新番周更表" },
  { id: "weekly_drama_collection", fileName: "weekly_drama_collection.json", type: "tv_series", platform: "tmdb", name: "国产追剧周更表" },
  { id: "weekly_guoman_collection", fileName: "weekly_guoman_collection.json", type: "animation", platform: "tmdb", name: "国漫追番周历表" },
  { id: "weekly_korean_drama_collection", fileName: "weekly_korean_drama_collection.json", type: "tv_series", platform: "tmdb", name: "韩剧追剧周更表" },
  { id: "weekly_japanese_drama_collection", fileName: "weekly_japanese_drama_collection.json", type: "tv_series", platform: "tmdb", name: "日剧追剧周更表" },
  { id: "weekly_sea_drama_collection", fileName: "weekly_sea_drama_collection.json", type: "tv_series", platform: "tmdb", name: "东南亚剧周更表" },
  // === 👇 单项分类 👇 ===
  { id: "tmdb_popular_movies", fileName: "tmdb-popular-movies.json", type: "movie", platform: "tmdb", name: "今日热门电影" },
  { id: "tmdb_popular_tv", fileName: "tmdb-popular-tv.json", type: "tv_series", platform: "tmdb", name: "今日热门电视剧" },
  { id: "bangumi_airing", fileName: "bangumi-airing.json", type: "animation", platform: "bangumi", name: "今日热门番剧" },
  { id: "douban_tv_custom", fileName: "douban-tv-custom.json", type: "tv_series", platform: "douban", name: "时下热门国产剧" },
  { id: "tmdb_tv_netflix", fileName: "tmdb-tv-netflix.json", type: "tv_series", platform: "tmdb", name: "Netflix 全球热播好剧" },
  { id: "variety_cn", fileName: "variety-cn.json", type: "variety_show", platform: "tmdb", name: "热门国产综艺" },
  { id: "variety_kr", fileName: "variety-kr.json", type: "variety_show", platform: "tmdb", name: "爆款韩国综艺" },
  { id: "variety_global", fileName: "variety-global.json", type: "variety_show", platform: "tmdb", name: "全球流媒体新热综艺" },
  { id: "tmdb_tv_hbo", fileName: "tmdb-tv-hbo.json", type: "tv_series", platform: "tmdb", name: "HBO 高分神剧" },
  { id: "tmdb_tv_apple", fileName: "tmdb-tv-apple.json", type: "tv_series", platform: "tmdb", name: "Apple TV+ 原创精品" },
  { id: "trakt_movies", fileName: "trakt-movies.json", type: "movie", platform: "trakt", name: "火爆全球欧美大片" },
  { id: "tmdb_anime_cn", fileName: "tmdb-anime-cn.json", type: "animation", platform: "tmdb", name: "热门国产动漫" },
  { id: "trakt_shows", fileName: "trakt-shows.json", type: "tv_series", platform: "tmdb", name: "时下热播欧美剧集" },
  { id: "douban_movies", fileName: "douban-movies.json", type: "movie", platform: "douban", name: "实时热门电影" },
  { id: "douban_korean_tv", fileName: "douban-korean-tv.json", type: "korean_tv_series", platform: "douban", name: "备受欢迎的韩剧推荐" },
  { id: "tmdb_tv_ja", fileName: "tmdb-tv-ja.json", type: "japanese_tv_series", platform: "tmdb", name: "细腻又治愈的高人气日剧" },
  { id: "tmdb_anime_jp", fileName: "tmdb-anime-jp.json", type: "animation", platform: "tmdb", name: "近期热门日本动漫" },
  { id: "imdb_top_anime", fileName: "imdb-top-anime.json", type: "animation", platform: "imdb", name: "IMDb 史诗动漫神作" },
  { id: "prime_hot_anime", fileName: "prime-hot-anime.json", type: "animation", platform: "prime", name: "Prime Video 热门日漫" },
  { id: "filmarks_anime_movie", fileName: "filmarks-anime-movie.json", type: "animation_movie", platform: "filmarks", name: "Filmarks 高分剧场版" },
  { id: "netflix_hot_anime", fileName: "netflix-hot-anime.json", type: "animation", platform: "netflix", name: "Netflix 独播霸榜日漫" },
  { id: "tmdb_anime_top_ja", fileName: "tmdb-anime-top-ja.json", type: "animation", platform: "tmdb", name: "TMDB 高分神作日漫" },
  { id: "tmdb_anime_movie_ja", fileName: "tmdb-anime-movie-ja.json", type: "animation_movie", platform: "tmdb", name: "备受好评的动画电影" },
  { id: "tmdb_tv_es", fileName: "tmdb-tv-es.json", type: "spanish_tv_series", platform: "tmdb", name: "时下流行的西语剧集" },
  { id: "tmdb_tv_tw", fileName: "tmdb-tv-tw.json", type: "taiwanese_tv_series", platform: "tmdb", name: "台剧当然也不能落下" },
  { id: "tmdb_movie_tw", fileName: "tmdb-movie-tw.json", type: "taiwanese_movie", platform: "tmdb", name: "台味浓浓的宝藏台片" },
  { id: "tmdb_movie_sea", fileName: "tmdb-movie-sea.json", type: "southeast_asian_movie", platform: "tmdb", name: "荷尔模超标的东南亚" },
  { id: "tmdb_movie_hk_erotic_comedy", fileName: "tmdb-movie-hk-erotic-comedy.json", type: "movie", platform: "tmdb", name: "港产经典风月喜剧" },
  { id: "tmdb_tv_th", fileName: "tmdb-tv-th.json", type: "thai_tv_series", platform: "tmdb", name: "狗血上头的爆款泰剧" },
  { id: "tmdb_movie_th", fileName: "tmdb-movie-th.json", type: "thai_movie", platform: "tmdb", name: "不止鬼片的泰国电影" },
  { id: "tmdb_tv_bl", fileName: "tmdb-tv-bl.json", type: "tv_series", platform: "tmdb", name: "暧昧拉扯到极致的亚洲耽美神作" },
  { id: "netflix_tv_minor", fileName: "netflix-tv-minor.json", type: "tv_series", platform: "tmdb", name: "Netflix 小语种神剧" },
  { id: "netflix_movie_minor", fileName: "netflix-movie-minor.json", type: "movie", platform: "tmdb", name: "冷门却惊艳的小语种电影" }
];

const CATEGORY_MAP = {};
CATEGORY_CONFIGS.forEach(c => CATEGORY_MAP[c.id] = c);

const SAFE_LANGS = "zh,zh-CN,zh-TW,zh-HK,en,ja,ko,th,es,fr,de,ru,pt,tl,id,vi,null";
const ALL_MASK = (1n << BigInt(CATEGORY_CONFIGS.length)) - 1n;
const HEADERS_API = { "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1", "Accept": "application/json" };
const HEADERS_BROWSER = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36", "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" };
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function cleanSearchQuery(title) {
  if (!title) return "";
  return String(title)
    .replace(/[《》【】\[\]（）()]/g, " ")
    .replace(/第[一二三四五六七八九十\d]+[季部期]/g, "")
    .replace(/(特别篇|完结篇|剧场版|国语版|粤语版|重制版|真人版|电影版|年番)/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeHTML(str) {
  return str ? String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') : '';
}

function buildOldDataHelper(itemsArray) {
    const mapById = new Map();
    const mapByTitle = new Map();

    const normalize = (t) => String(t || "").replace(/[\s·《》【】\[\]()（）\-_:：]/g, "").toLowerCase();

    if (Array.isArray(itemsArray)) {
        itemsArray.forEach(item => {
            if (item.tmdbId !== undefined && item.tmdbId !== null) {
                mapById.set(String(item.tmdbId), item);
                mapById.set(Number(item.tmdbId), item);
            }
            if (item.title) {
                const cleanT = normalize(item.title);
                if (cleanT) mapByTitle.set(cleanT, item);
            }
        });
    }

    return {
        find(tmdbId, title) {
            if (tmdbId !== undefined && tmdbId !== null) {
                if (mapById.has(String(tmdbId))) return mapById.get(String(tmdbId));
                if (mapById.has(Number(tmdbId))) return mapById.get(Number(tmdbId));
            }
            if (title) {
                const cleanT = normalize(title);
                if (cleanT && mapByTitle.has(cleanT)) return mapByTitle.get(cleanT);
                
                for (const [k, v] of mapByTitle.entries()) {
                    if (k.includes(cleanT) || cleanT.includes(k)) return v;
                }
            }
            return null;
        }
    };
}

// ==========================================
// 3. 分类隔离黑名单 核心逻辑
// ==========================================
async function addToBlacklist(env, items, categoryId) {
  if (!env.R2_BUCKET || !items || items.length === 0 || !categoryId) return;
  let blacklist = { categories: {}, global: { ids: [], titles: [] } };
  try {
    const obj = await env.R2_BUCKET.get("blacklist.json");
    if (obj) {
      const data = await obj.json();
      if (data.categories || data.global) {
        blacklist = data;
        if (!blacklist.categories) blacklist.categories = {};
        if (!blacklist.global) blacklist.global = { ids: [], titles: [] };
      } else {
        blacklist.global = { ids: data.ids || [], titles: data.titles || [] };
        blacklist.categories = {};
      }
    }
  } catch (e) {}

  const baseCatId = categoryId.split('-')[0];
  if (!blacklist.categories[baseCatId]) {
    blacklist.categories[baseCatId] = { ids: [], titles: [] };
  }

  let catObj = blacklist.categories[baseCatId];
  let idSet = new Set((catObj.ids || []).map(String));
  let titleSet = new Set((catObj.titles || []).map(t => String(t).trim().toLowerCase()));

  items.forEach(item => {
    if (item.tmdbId) idSet.add(String(item.tmdbId));
    if (item.title) {
      const cleanT = String(item.title).replace(/[\s·《》\-_]/g, "").toLowerCase();
      if (cleanT) titleSet.add(cleanT);
    }
  });

  catObj.ids = Array.from(idSet);
  catObj.titles = Array.from(titleSet);

  await env.R2_BUCKET.put("blacklist.json", JSON.stringify(blacklist, null, 2), {
    httpMetadata: { contentType: "application/json" }
  });
}

async function getBlacklist(env) {
  if (!env.R2_BUCKET) return { categories: {}, global: { ids: new Set(), titles: new Set() } };
  try {
    const obj = await env.R2_BUCKET.get("blacklist.json");
    if (obj) {
      const data = await obj.json();
      const result = {
        categories: {},
        global: {
          ids: new Set((data.global?.ids || data.ids || []).map(String)),
          titles: new Set((data.global?.titles || data.titles || []).map(t => String(t).replace(/[\s·《》\-_]/g, "").toLowerCase()))
        }
      };
      if (data.categories) {
        for (const catKey of Object.keys(data.categories)) {
          result.categories[catKey] = {
            ids: new Set((data.categories[catKey].ids || []).map(String)),
            titles: new Set((data.categories[catKey].titles || []).map(t => String(t).replace(/[\s·《》\-_]/g, "").toLowerCase()))
          };
        }
      }
      return result;
    }
  } catch (e) {}
  return { categories: {}, global: { ids: new Set(), titles: new Set() } };
}

function isItemBlacklisted(item, blacklist, categoryId) {
  if (!item || !blacklist) return false;
  
  if (item.tmdbId && blacklist.global.ids.has(String(item.tmdbId))) return true;
  if (item.title) {
    const cleanT = String(item.title).replace(/[\s·《》\-_]/g, "").toLowerCase();
    if (cleanT && blacklist.global.titles.has(cleanT)) return true;
  }

  if (categoryId) {
    const baseCatId = categoryId.split('-')[0];
    const catBlacklist = blacklist.categories[baseCatId];
    if (catBlacklist) {
      if (item.tmdbId && catBlacklist.ids.has(String(item.tmdbId))) return true;
      if (item.title) {
        const cleanT = String(item.title).replace(/[\s·《》\-_]/g, "").toLowerCase();
        if (cleanT && catBlacklist.titles.has(cleanT)) return true;
      }
    }
  }

  return false;
}

// ==========================================
// 4. 网络请求与 Telegram 消息辅助函数
// ==========================================
async function safeFetch(url, options, reqCtx) {
  if (reqCtx) {
    if (reqCtx.subreqs >= reqCtx.maxSubreqs) throw new Error("CF_LIMIT");
    reqCtx.subreqs++;
  }
  return fetch(url, options);
}

async function sendTgMessage(env, text, chatIdOverride, replyMarkup) {
  const targetChatId = chatIdOverride || env.TG_CHAT_ID;
  if (!env.TG_BOT_TOKEN || !targetChatId) return;
  try {
    const url = `https://api.telegram.org/bot${env.TG_BOT_TOKEN}/sendMessage`;
    const body = { chat_id: targetChatId, text: text, parse_mode: 'HTML', disable_web_page_preview: true };
    if (replyMarkup) body.reply_markup = replyMarkup;
    await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  } catch (e) {}
}

async function editTgMessage(env, chatId, msgId, text, reqCtx, replyMarkup) {
  try {
    const url = `https://api.telegram.org/bot${env.TG_BOT_TOKEN}/editMessageText`;
    const body = { chat_id: chatId, message_id: msgId, text: text, parse_mode: 'HTML', disable_web_page_preview: true };
    if (replyMarkup) body.reply_markup = replyMarkup;
    await safeFetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }, reqCtx);
  } catch (e) {}
}

// ==========================================
// 5. 各第三方平台 API 抓取适配器
// ==========================================
async function fetchBangumiCalendar(limit = 100, reqCtx) {
  try {
    const res = await safeFetch('https://api.bgm.tv/calendar', { headers: { 'User-Agent': 'EPlayerX/1.0' } }, reqCtx);
    if (!res.ok) return [];
    const data = await res.json();
    let items = [];
    data.forEach(day => { day.items.forEach(anime => { items.push({ title: anime.name_cn || anime.name, score: anime.rating?.score || 0 }); }); });
    items.sort((a, b) => b.score - a.score);
    return items.slice(0, limit);
  } catch(e) { return []; }
}

async function fetchTMDBTrending(type, env, limit = 100, reqCtx) {
  if (!env.TMDB_ACCESS_TOKEN) throw new Error("缺少 TMDB_ACCESS_TOKEN");
  let results = [];
  const pagesToFetch = Math.ceil(limit / 20);
  
  for (let page = 1; page <= pagesToFetch; page++) {
    try {
      let queryUrl = `https://api.themoviedb.org/3/trending/${type}/day?language=zh-CN&page=${page}`;
      if (reqCtx && reqCtx.clearCooldown) queryUrl += `&_cb=${Date.now()}`;
      
      const res = await safeFetch(queryUrl, { headers: { "Authorization": `Bearer ${env.TMDB_ACCESS_TOKEN}`, "Accept": "application/json" } }, reqCtx);
      if (res.ok) { const data = await res.json(); results.push(...(data.results || [])); }
    } catch (e) { break; }
  }
  return results.slice(0, limit).map(item => ({ title: item.title || item.name, tmdbId: item.id, poster_path: item.poster_path, backdrop_path: item.backdrop_path, vote_average: item.vote_average, original_language: item.original_language, origin_country: item.origin_country || [], release_date: item.release_date, first_air_date: item.first_air_date, popularity: item.popularity }));
}

async function fetchTMDBDiscoverList(type, paramsObj, env, limit = 100, reqCtx) {
  if (!env.TMDB_ACCESS_TOKEN) throw new Error("缺少 TMDB_ACCESS_TOKEN");
  let results = [];
  const pagesToFetch = Math.ceil(limit / 20);
  
  for (let page = 1; page <= pagesToFetch; page++) {
    const query = new URLSearchParams({ language: 'zh-CN', sort_by: 'popularity.desc', page: page.toString(), ...paramsObj }).toString();
    let queryUrl = `https://api.themoviedb.org/3/discover/${type}?${query}`;
    if (reqCtx && reqCtx.clearCooldown) queryUrl += `&_cb=${Date.now()}`;
    
    try {
      const res = await safeFetch(queryUrl, { headers: { "Authorization": `Bearer ${env.TMDB_ACCESS_TOKEN}`, "Accept": "application/json" } }, reqCtx);
      if (res.ok) { const data = await res.json(); results.push(...(data.results || [])); }
    } catch (e) { break; }
  }
  return results.slice(0, limit).map(item => ({
    title: item.title || item.name, tmdbId: item.id, overview: item.overview, vote_average: item.vote_average,
    poster_path: item.poster_path, backdrop_path: item.backdrop_path, first_air_date: item.first_air_date, release_date: item.release_date,
    popularity: item.popularity, origin_country: item.origin_country || [], original_language: item.original_language,
    genre_ids: item.genre_ids || []
  }));
}

async function fetchTraktTrending(type, env, limit = 100, reqCtx) {
  if (!env.TRAKT_CLIENT_ID) throw new Error("缺少 TRAKT_CLIENT_ID");
  let res;
  try {
    res = await safeFetch(`https://api.trakt.tv/${type}/trending?page=1&limit=${limit}`, { headers: { "Content-Type": "application/json", "trakt-api-version": "2", "trakt-api-key": env.TRAKT_CLIENT_ID, "User-Agent": HEADERS_BROWSER["User-Agent"] } }, reqCtx);
  } catch(e) { return []; }
  if (!res.ok) {
    try {
      return await fetchTMDBTrending(type === 'movies' ? 'movie' : 'tv', env, limit, reqCtx);
    } catch(e) { return []; }
  }
  const data = await res.json();
  return data.map(item => { const obj = type === 'movies' ? item.movie : item.show; return { title: obj.title, tmdbId: obj.ids.tmdb }; }).filter(i => i.tmdbId).slice(0, limit);
}

async function fetchDoubanRecentHot(kind, query, limit = 100, reqCtx) {
  let results = [];
  let start = 0;
  while (results.length < limit) {
    let currentLimit = Math.min(limit - results.length, 50);
    const base = kind === "movie" ? "https://m.douban.com/rexxar/api/v2/subject/recent_hot/movie" : "https://m.douban.com/rexxar/api/v2/subject/recent_hot/tv";
    const params = new URLSearchParams({ start: start.toString(), limit: currentLimit.toString(), ...query });
    try {
      const res = await safeFetch(`${base}?${params.toString()}`, { headers: { ...HEADERS_API, Referer: "https://m.douban.com/" } }, reqCtx);
      if (!res.ok) break;
      const data = await res.json();
      if (!data.items || data.items.length === 0) break;
      results.push(...data.items.map(item => ({ title: item.title })));
      start += data.items.length;
      if (data.items.length < currentLimit) break;
    } catch (e) { break; }
  }
  return results.slice(0, limit);
}

async function fetchDoubanSubjectCollection(collectionId, limit = 100, reqCtx) {
  let results = [];
  let start = 0;
  while (results.length < limit) {
    let currentLimit = Math.min(limit - results.length, 50);
    const params = new URLSearchParams({ start: start.toString(), count: currentLimit.toString() });
    try {
      const res = await safeFetch(`https://m.douban.com/rexxar/api/v2/subject_collection/${collectionId}/items?${params.toString()}`, { headers: { ...HEADERS_API, Referer: "https://m.douban.com/" } }, reqCtx);
      if (!res.ok) break;
      const data = await res.json();
      const items = data.subject_collection_items || data.items || [];
      if (items.length === 0) break;
      results.push(...items.map(item => ({ title: item.title })));
      start += items.length;
      if (items.length < currentLimit) break;
    } catch(e) { break; }
  }
  return results.slice(0, limit);
}

async function tmdbFetch(path, paramsObj, env, reqCtx) {
  let query = new URLSearchParams(paramsObj).toString();
  if (reqCtx && reqCtx.clearCooldown) query += `&_cb=${Date.now()}`;
  const res = await safeFetch(`https://api.themoviedb.org/3${path}?${query}`, { headers: { "Authorization": `Bearer ${env.TMDB_ACCESS_TOKEN}`, "accept": "application/json" } }, reqCtx);
  if (!res.ok) throw new Error("TMDB 拒绝");
  return await res.json();
}

// ==========================================
// 6. 核心图层脱水提取引擎
// ==========================================
function extractImages(images, backdropPath, posterPath, origLang) {
  const backdrops = (images && Array.isArray(images.backdrops)) ? images.backdrops : [];
  const logos = (images && Array.isArray(images.logos)) ? images.logos : [];
  const posters = (images && Array.isArray(images.posters)) ? images.posters : [];

  const isStrictClean = (item) => {
    if (!item) return false;
    const l = item.iso_639_1;
    return l === null || l === undefined || l === '' || l === 'xx' || l === 'none' || l === 'null';
  };

  const targetOrig = (origLang || "").toLowerCase();

  const getLogoScore = (l) => {
    const lang = (l.iso_639_1 || "").toLowerCase();
    let score = 0;
    if (targetOrig && (lang === targetOrig || (targetOrig === 'zh' && lang.startsWith('zh')))) {
      score = 100000;
    } else if (isStrictClean(l)) {
      score = 80000;
    } else if (lang === 'en') {
      score = 60000;
    } else if (lang === 'zh' || lang.startsWith('zh')) {
      score = 40000;
    } else {
      score = 10000;
    }
    return score + ((l.vote_average || 0) * 

100) + (l.vote_count || 0);
  };

  const sortedLogos = [...logos].sort((a, b) => getLogoScore(b) - getLogoScore(a));
  const logo = sortedLogos[0]?.file_path || null;

  // ==========================================
  // 🌟 2. 轮播图专属：纯净【无字】竖海报 (noLogoPoster)
  // 🚨 核心铁律：严格只取 isStrictClean 为 true 的无字图！绝不拿带字图兜底！
  // ==========================================
  const cleanPosters = posters.filter(p => isStrictClean(p))
                              .sort((a, b) => ((b.vote_average || 0) * 100 + (b.vote_count || 0)) - ((a.vote_average || 0) * 100 + (a.vote_count || 0)));

  const noLogoPoster = cleanPosters[0]?.file_path || null;

  // ==========================================
  // 🌟 3. 列表小卡片专属：官方【带字】竖海报 (poster_path)
  // ==========================================
  const getTextPosterScore = (p) => {
    const lang = (p.iso_639_1 || "").toLowerCase();
    let score = 0;
    if (lang === 'zh' || lang.startsWith('zh')) score = 30000;
    else if (targetOrig && (lang === targetOrig || (targetOrig === 'zh' && lang.startsWith('zh')))) score = 20000;
    else if (lang === 'en') score = 10000;
    else score = 1000;
    return score + (p.vote_average || 0) * 100;
  };

  const textPosters = posters.filter(p => !isStrictClean(p))
                             .sort((a, b) => getTextPosterScore(b) - getTextPosterScore(a));

  const officialPoster = textPosters[0]?.file_path || cleanPosters[0]?.file_path || posterPath || null;

  // ==========================================
  // 🌟 4. TV/iPad 专属：纯净【无字】横屏大背景 (backdrop_path)
  // ==========================================
  const cleanBackdrops = backdrops.filter(b => isStrictClean(b))
                                  .sort((a, b) => ((b.vote_average || 0) * 100 + (b.vote_count || 0)) - ((a.vote_average || 0) * 100 + (a.vote_count || 0)));

  const cleanBackdrop = cleanBackdrops[0]?.file_path || null;

  // ==========================================
  // 🌟 5. 小横图专属：官方【带字】剧照 (thumb)
  // ==========================================
  const getTextBackdropScore = (b) => {
    const lang = (b.iso_639_1 || "").toLowerCase();
    let score = 0;
    if (targetOrig && (lang === targetOrig || (targetOrig === 'zh' && lang.startsWith('zh')))) score = 30000;
    else if (lang === 'zh' || lang.startsWith('zh')) score = 20000;
    else if (lang === 'en') score = 10000;
    else score = 1000;
    return score + (b.vote_average || 0) * 100;
  };

  const textBackdrops = backdrops.filter(b => !isStrictClean(b))
                                 .sort((a, b) => getTextBackdropScore(b) - getTextBackdropScore(a));

  const thumb = textBackdrops[0]?.file_path || cleanBackdrops[0]?.file_path || backdropPath || null;

  return { officialPoster, noLogoPoster, thumb, cleanBackdrop, logo };
}

function deduplicateByTmdbId(items) {
  const seenIds = new Set();
  const seenTitles = new Set();
  const result = [];
  
  for (const item of items) {
    if (!item.tmdbId) continue;
    item.poster_path = item.poster_path || item.noLogoPoster || item.thumb || item.backdrop_path;
    if (!item.poster_path) continue;
    
    const cleanTitle = (item.title || "").replace(/[\s·]/g, "").toLowerCase();
    
    if (seenIds.has(item.tmdbId) || (cleanTitle && seenTitles.has(cleanTitle))) {
        continue; 
    }
    
    seenIds.add(item.tmdbId);
    if (cleanTitle) seenTitles.add(cleanTitle);
    
    result.push(item);
  }
  return result;
}

function deduplicateRawList(items) {
    const seen = new Set();
    const result = [];
    for (const item of items) {
        const key = item.tmdbId ? `id_${item.tmdbId}` : `title_${item.title}`;
        if (seen.has(key)) continue;
        seen.add(key);
        result.push(item);
    }
    return result;
}

async function fetchFourRatings(tmdbId, imdbId, mediaType, env, reqCtx) {
  let traktScore = null;
  let imdbScore = null;
  let rtScore = null;

  if (reqCtx.subreqs >= reqCtx.maxSubreqs - 2) {
    return { traktScore, imdbScore, rtScore };
  }

  // 🌟 1. 优先使用 MDBList（电影与电视剧通杀，官方规范 API 地址）
  if (env.MDBLIST_API_KEY && (tmdbId || imdbId)) {
    try {
      const isTv = mediaType === 'tv' || mediaType === 'tv_series';
      const mType = isTv ? 'show' : 'movie';
      
      // MDBList 官方标准直接请求路径
      const mUrl = tmdbId 
        ? `https://api.mdblist.com/tmdb/${mType}/${tmdbId}?apikey=${env.MDBLIST_API_KEY}`
        : `https://api.mdblist.com/imdb/${imdbId}?apikey=${env.MDBLIST_API_KEY}`;
      
      const mRes = await safeFetch(mUrl, { headers: { "Accept": "application/json", "User-Agent": "Mozilla/5.0" } }, reqCtx);
      if (mRes.ok) {
        const mData = await mRes.json();
        if (mData && Array.isArray(mData.ratings)) {
          mData.ratings.forEach(r => {
            const src = String(r.source || "").toLowerCase();
            // IMDb (0-10)
            if (src === 'imdb' && typeof r.value === 'number') {
              imdbScore = r.value <= 10 ? r.value : Number((r.value / 10).toFixed(1));
            }
            // Trakt (0-10)
            if (src === 'trakt' && typeof r.value === 'number') {
              traktScore = r.value <= 10 ? Number(r.value.toFixed(1)) : Number((r.value / 10).toFixed(1));
            }
            // 烂番茄 (Tomatometer % 影评人指数，电影和剧集均有)
            if ((src === 'tomatoes' || src === 'rottentomatoes') && (r.score || r.value)) {
              rtScore = parseInt(r.score || r.value, 10);
            }
          });

          if (imdbScore || traktScore || rtScore) {
            return { traktScore, imdbScore, rtScore };
          }
        }
      }
    } catch(e) {}
  }

  // 🌟 2. 兜底备用：未配 MDBLIST 时回退使用 OMDb
  if (env.OMDB_API_KEY && imdbId && reqCtx.subreqs < reqCtx.maxSubreqs - 2) {
    try {
      const omdbRes = await safeFetch(`https://www.omdbapi.com/?i=${imdbId}&apikey=${env.OMDB_API_KEY}&tomatoes=true`, {}, reqCtx);
      if (omdbRes.ok) {
        const oData = await omdbRes.json();
        if (oData && oData.Response === "True") {
          if (!imdbScore && oData.imdbRating && oData.imdbRating !== "N/A") {
            imdbScore = parseFloat(oData.imdbRating);
          }
          const rtObj = (oData.Ratings || []).find(r => r.Source === "Rotten Tomatoes");
          if (!rtScore && rtObj && rtObj.Value) {
            rtScore = parseInt(rtObj.Value.replace('%', ''), 10);
          } else if (!rtScore && oData.tomatoMeter && oData.tomatoMeter !== "N/A") {
            rtScore = parseInt(oData.tomatoMeter, 10);
          }
        }
      }
    } catch(e) {}
  }

  // 🌟 3. 兜底备用：未配 MDBLIST 时回退使用 Trakt
  if (!traktScore && env.TRAKT_CLIENT_ID && reqCtx.subreqs < reqCtx.maxSubreqs - 2) {
    try {
      const traktType = (mediaType === 'movie') ? 'movies' : 'shows';
      const targetId = imdbId || tmdbId;
      if (targetId) {
        const traktRes = await safeFetch(`https://api.trakt.tv/${traktType}/${targetId}/ratings`, {
          headers: {
            "Content-Type": "application/json",
            "trakt-api-version": "2",
            "trakt-api-key": env.TRAKT_CLIENT_ID,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
          }
        }, reqCtx);
        if (traktRes.ok) {
          const tData = await traktRes.json();
          if (tData && typeof tData.rating === 'number') {
            traktScore = Number(tData.rating.toFixed(1));
          }
        }
      }
    } catch(e) {}
  }

  return { traktScore, imdbScore, rtScore };
}
// ==========================================
// 7. TMDB 详细数据加工处理
// ==========================================
async function processItemsWithTMDB(items, mediaType, env, limit = 100, options = {}, reqCtx) {
  const results = [];
  const limitedItems = items.slice(0, limit);

  for (let i = 0; i < limitedItems.length; i++) {
    const item = limitedItems[i];
    if (i > 0) await delay(80);

    let titleToSearch = item.searchQuery || item.title || item.name || "";

    let oldRecord = null;
    if (options.oldDataHelper) {
      oldRecord = options.oldDataHelper.find(item.tmdbId, titleToSearch);
    }

    let tmdbId = item.tmdbId || oldRecord?.tmdbId || null;
    let basicData = item;
    let detectedType = item.media_type || oldRecord?.media_type || mediaType;

    const TMDB_IMG = 'https://image.tmdb.org/t/p/original';
    const TMDB_IMG_LOGO = 'https://image.tmdb.org/t/p/original';
    const toAbs = (p) => (!p || p.startsWith('data:')) ? null : ((p.startsWith('http') || p.startsWith('/api/')) ? p : TMDB_IMG + (p.startsWith('/') ? p : '/' + p));
    const toAbsLogo = (p) => (!p || p.startsWith('data:')) ? null : ((p.startsWith('http') || p.startsWith('/api/')) ? p : TMDB_IMG_LOGO + (p.startsWith('/') ? p : '/' + p));
    const upgradeToOriginal = (url) => (url && typeof url === 'string' && url.includes('image.tmdb.org')) ? url.replace(/\/w\d+/, '/original') : url;

    const isCorruptedFakeClean = oldRecord?.noLogoPoster && oldRecord.noLogoPoster === oldRecord.poster_path && oldRecord.no_logo_poster_source !== 'manual';
    
    let finalPoster = upgradeToOriginal(oldRecord?.poster_path || toAbs(basicData.poster_path));
    let finalNoLogoPoster = isCorruptedFakeClean ? null : upgradeToOriginal(oldRecord?.noLogoPoster || null);
    let finalThumb = upgradeToOriginal(oldRecord?.thumb || toAbs(basicData.backdrop_path || basicData.poster_path));
    let finalBackdrop = upgradeToOriginal(oldRecord?.backdrop_path || toAbs(basicData.backdrop_path || basicData.poster_path));
    let finalLogo = upgradeToOriginal(oldRecord?.logo || null);

    let finalPosterSource = oldRecord?.poster_source || 'auto';
    let finalNoLogoSource = isCorruptedFakeClean ? 'auto' : (oldRecord?.no_logo_poster_source || 'auto');
    let finalThumbSource = oldRecord?.thumb_source || 'auto';
    let finalBackdropSource = oldRecord?.backdrop_source || 'auto';
    let finalLogoSource = oldRecord?.logo_source || 'auto';

    // 2. 检查老数据是否真正完备（只要缺少烂番茄/Trakt/IMDb任何一个，立刻触发强制抓取）
    const hasRealLogo = !!(finalLogo && !finalLogo.includes('text_logo.svg'));
    const hasRealClean = !!finalNoLogoPoster;
    
    // 🌟 核心防死锁：只要配置了 MDBList/OMDb/Trakt 且旧数据中没有烂番茄，绝对不算完备，必须重新联网抓取！
    const needsRt = !!((env.MDBLIST_API_KEY || env.OMDB_API_KEY) && !oldRecord?.ratings?.rotten_tomatoes && !oldRecord?.rotten_tomatoes && !oldRecord?.tomato_rating);
    const needsTrakt = !!(env.TRAKT_CLIENT_ID && !oldRecord?.ratings?.trakt && !oldRecord?.trakt_rating);
    const needsImdb = !!(env.OMDB_API_KEY && !oldRecord?.ratings?.imdb && !oldRecord?.imdb_rating);
    const hasRatings = !needsRt && !needsTrakt && !needsImdb && !!oldRecord?.ratings?.tmdb;
    
    const isCompletelyReady = oldRecord && hasRealLogo && hasRealClean && !isCorruptedFakeClean && hasRatings;

    if (!tmdbId && !isCompletelyReady && reqCtx.subreqs < (reqCtx.maxSubreqs - 4)) {
      try {
        const cleanQ = cleanSearchQuery(titleToSearch);
        const searchParams = { query: cleanQ || titleToSearch, language: "zh-CN" };
        if (options.include_adult) searchParams.include_adult = "true";

        let data = await tmdbFetch(mediaType === "movie" ? "/search/movie" : "/search/multi", searchParams, env, reqCtx);
        let sr = data.results || [];

        if (sr.length === 0 && cleanQ !== titleToSearch) {
          searchParams.query = titleToSearch;
          data = await tmdbFetch(mediaType === "movie" ? "/search/movie" : "/search/multi", searchParams, env, reqCtx);
          sr = data.results || [];
        }

        if (sr.length > 0) {
          let matched = null;
          if (mediaType === "tv") {
            matched = sr.find(x => x.media_type === "tv" || x.first_air_date) || sr.find(x => x.media_type === "movie" || x.release_date) || sr[0];
          } else {
            matched = sr.find(x => x.media_type === "movie" || x.release_date) || sr[0];
          }

          if (matched) {
            tmdbId = matched.id;
            basicData = matched;
            detectedType = matched.media_type || (matched.first_air_date ? "tv" : "movie") || mediaType;
          }
        }
      } catch(e) {}
    }

    if (tmdbId && !oldRecord && options.oldDataHelper) {
      oldRecord = options.oldDataHelper.find(tmdbId, titleToSearch);
    }

    if (tmdbId || oldRecord) {
      let origLang = basicData.original_language || item.original_language || oldRecord?.original_language || "";
      let originCountries = basicData.origin_country || item.origin_country || [];

      if (options.isJapaneseAnimeOnly) {
        if (origLang && origLang !== 'ja') continue;
        if (Array.isArray(originCountries) && (originCountries.includes('CN') || originCountries.includes('TW') || originCountries.includes('HK'))) {
          continue;
        }
      }

      if (options.isDomesticDramaOnly) {
        const genres = basicData.genre_ids || oldRecord?.genre_ids || [];
        if (genres.some(g => [16, 10764, 10767, 99, 10763].includes(g))) {
          continue;
        }
      }

      let needDetailFetch = false;
      if (reqCtx.clearCooldown || !oldRecord || !isCompletelyReady) {
        needDetailFetch = true;
      }

      if (needDetailFetch && reqCtx.subreqs >= (reqCtx.maxSubreqs - 3)) {
        needDetailFetch = false;
      }

      let actualMediaType = detectedType;
      if (actualMediaType !== 'movie' && actualMediaType !== 'tv') actualMediaType = mediaType;

      let details = null;
      let imagesData = null;

      if (needDetailFetch && tmdbId) {
        try {
          const apiPath = actualMediaType === "movie" ? `/movie/${tmdbId}` : `/tv/${tmdbId}`;
          details = await tmdbFetch(apiPath, { language: "zh-CN", append_to_response: "external_ids" }, env, reqCtx).catch(() => null);
          imagesData = await tmdbFetch(`${apiPath}/images`, {}, env, reqCtx).catch(() => null);

          if (options.isDomesticDramaOnly && details) {
            const genresArr = details.genres || [];
            if (genresArr.some(g => [16, 10764, 10767, 99, 10763].includes(g.id))) continue;
          }

          if (details && imagesData) {
            const realOrigLang = details.original_language || origLang || "";
            const ext = extractImages(imagesData, details.backdrop_path, details.poster_path, realOrigLang);

            if (ext.logo && finalLogoSource !== 'manual') finalLogo = toAbsLogo(ext.logo);
            if (ext.officialPoster && finalPosterSource !== 'manual') finalPoster = toAbs(ext.officialPoster);
            
            if (ext.noLogoPoster && finalNoLogoSource !== 'manual') {
              finalNoLogoPoster = toAbs(ext.noLogoPoster);
            }

            if (ext.thumb && finalThumbSource !== 'manual') finalThumb = toAbs(ext.thumb);
            if (ext.cleanBackdrop && finalBackdropSource !== 'manual') finalBackdrop = toAbs(ext.cleanBackdrop);
          }
        } catch(e) {}
      }

      const finalTitle = oldRecord?.title || details?.title || details?.name || basicData.title || basicData.name || item.title || "未知";
      const fallbackLogo = options.originUrl
        ? (options.originUrl + '/api/text_logo.svg?v=' + Date.now() + '&text=' + encodeURIComponent(finalTitle))
        : null;

      let rawDate = (
        details?.first_air_date ||
        details?.release_date ||
        details?.last_episode_air_date ||
        basicData.first_air_date ||
        basicData.release_date ||
        oldRecord?.first_air_date ||
        oldRecord?.release_date ||
        oldRecord?.air_date ||
        ""
      ).toString().trim();

      let validDate = null;
      const dateMatch = rawDate.match(/\b(19|20)\d{2}[-/.]\d{1,2}[-/.]\d{1,2}\b/);
      if (dateMatch) {
        const parts = dateMatch[0].split(/[-/.]/);
        validDate = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
      } else {
        const yearMatch = rawDate.match(/\b(19|20)\d{2}\b/);
        if (yearMatch) validDate = `${yearMatch[0]}-01-01`;
      }

      const finalYear = validDate ? validDate.substring(0, 4) : (oldRecord?.year || null);

      const resolvedImdbId = details?.external_ids?.imdb_id || details?.imdb_id || basicData.imdb_id || item.imdbId || oldRecord?.imdbId || null;
      const resolvedTvdbId = details?.external_ids?.tvdb_id || details?.tvdb_id || basicData.tvdb_id || item.tvdbId || oldRecord?.tvdbId || null;

      // 🌟 1. 继承老数据评分（确保已有数据 100% 继承，0 消耗 MDBList 额度）
      let extraRatings = { 
        traktScore: oldRecord?.trakt_rating || oldRecord?.traktRating || oldRecord?.ratings?.trakt || null, 
        imdbScore: oldRecord?.imdb_rating || oldRecord?.imdbRating || oldRecord?.ratings?.imdb || null, 
        rtScore: oldRecord?.rotten_tomatoes || oldRecord?.rottenTomatoes || oldRecord?.tomato_rating || oldRecord?.tomatoRating || oldRecord?.tomatoMeter || oldRecord?.tomatoes || oldRecord?.rt || oldRecord?.ratings?.rotten_tomatoes || oldRecord?.ratings?.rottenTomatoes || null 
      };

      if (needDetailFetch) {
        extraRatings = await fetchFourRatings(tmdbId, resolvedImdbId, actualMediaType, env, reqCtx);
      }

      const tmdbScore = Number((basicData.vote_average || details?.vote_average || oldRecord?.vote_average || 0).toFixed(1));
      const imdbScore = extraRatings.imdbScore ? Number(Number(extraRatings.imdbScore).toFixed(1)) : (oldRecord?.imdb_rating ? Number(oldRecord.imdb_rating) : undefined);
      const traktScore = extraRatings.traktScore ? Number(Number(extraRatings.traktScore).toFixed(1)) : (oldRecord?.trakt_rating ? Number(oldRecord.trakt_rating) : undefined);
      const rtScore = extraRatings.rtScore ? parseInt(extraRatings.rtScore, 10) : (oldRecord?.rotten_tomatoes ? parseInt(oldRecord.rotten_tomatoes, 10) : (oldRecord?.rottenTomatoes ? parseInt(oldRecord.rottenTomatoes, 10) : undefined));

      // 🌟 2. 顶级全兼容字段注入（全格式别名通杀，确保客户端 100% 亮起）
      results.push({
        id: tmdbId || oldRecord?.tmdbId || Math.floor(Math.random() * 1000000),
        name: finalTitle,
        title: finalTitle,
        tmdbId: tmdbId || oldRecord?.tmdbId,
        imdbId: resolvedImdbId,
        tvdbId: resolvedTvdbId,
        
        // 🌟 顶层全兼容字段
        vote_average: tmdbScore,
        imdb_rating: imdbScore || undefined,
        imdbRating: imdbScore || undefined,
        trakt_rating: traktScore || undefined,
        traktRating: traktScore || undefined,
        rotten_tomatoes: rtScore || undefined,
        rottenTomatoes: rtScore || undefined,
        tomato_rating: rtScore || undefined,
        tomatoRating: rtScore || undefined,
        tomatoMeter: rtScore || undefined,
        tomatoes: rtScore || undefined,
        rt: rtScore || undefined,
        
        // 🌟 聚合评分对象 (全兼容别名)
        ratings: {
          tmdb: tmdbScore > 0 ? tmdbScore : undefined,
          imdb: imdbScore || undefined,
          trakt: traktScore || undefined,
          rotten_tomatoes: rtScore || undefined,
          rottenTomatoes: rtScore || undefined,
          tomato_rating: rtScore || undefined,
          tomatoRating: rtScore || undefined,
          tomatoMeter: rtScore || undefined,
          tomatoes: rtScore || undefined,
          rt: rtScore || undefined
        },

        release_date: validDate || basicData.release_date || oldRecord?.release_date || null,
        first_air_date: validDate || basicData.first_air_date || oldRecord?.first_air_date || null,
        air_date: validDate || null,
        pubdate: validDate || null,
        year: finalYear,
        popularity: basicData.popularity || oldRecord?.popularity || 0,
        original_language: origLang || details?.original_language || "",
        poster_path: finalPoster,
        noLogoPoster: finalNoLogoPoster,
        poster_source: finalPosterSource,
        no_logo_poster_source: finalNoLogoSource,
        backdrop_path: finalBackdrop || finalThumb || finalPoster,
        backdrop_source: finalBackdropSource,
        genre_ids: basicData.genre_ids || oldRecord?.genre_ids || [],
        media_type: detectedType,
        overview: oldRecord?.overview || details?.overview || basicData.overview || null,
        thumb: finalThumb,
        thumb_source: finalThumbSource, 
        logo: finalLogo || fallbackLogo,
        logo_source: finalLogo ? finalLogoSource : 'auto', 
        verified_no_logo: !finalLogo || (finalLogo && finalLogo.includes('text_logo.svg')),
        logoEmptyAt: (!finalLogo || (finalLogo && finalLogo.includes('text_logo.svg'))) ? new Date().toISOString() : null,
        crawledAt: oldRecord?.crawledAt || new Date().toISOString(),
        image_scanned: true,
        last_episode_air_date: oldRecord?.last_episode_air_date || null,
        next_episode_air_date: oldRecord?.next_episode_air_date || null
      });

      if (deduplicateByTmdbId(results).length >= limit) break;
    }
  }

  return deduplicateByTmdbId(results).slice(0, limit);
}

function cleanAnimeTitle(title) {
    if (!title) return "";
    return title
        .replace(/第[一二三四五六七八九十百\d]+季/g, "")
        .replace(/最终季/g, "")
        .replace(/年番/g, "")
        .replace(/核心季/g, "")
        .replace(/最终章/g, "")
        .replace(/完结篇/g, "")
        .replace(/特别篇/g, "")
        .replace(/神篇/g, "")
        .replace(/·/g, "")
        .replace(/\s+/g, "") 
        .trim();
}

function determineDay(item, bgmCalendar, standardDays, overrides) {
    const titleKey = item.title ? item.title.trim() : "";
    const cleanTitle = cleanAnimeTitle(titleKey);

    if (overrides[item.tmdbId]) return overrides[item.tmdbId];
    if (overrides[titleKey]) return overrides[titleKey];
    
    for (const ovKey of Object.keys(overrides)) {
        if (!/^\d+$/.test(ovKey)) {
            if (titleKey.includes(ovKey) || ovKey.includes(titleKey) || cleanTitle.includes(ovKey) || ovKey.includes(cleanTitle)) {
                return overrides[ovKey];
            }
        }
    }

    if (bgmCalendar) {
        for (const bgmKey of Object.keys(bgmCalendar)) {
            if (bgmKey.includes(cleanTitle) || cleanTitle.includes(bgmKey)) {
                return bgmCalendar[bgmKey].day;
            }
        }
    }

    if (standardDays) {
        for (const stdKey of Object.keys(standardDays)) {
            if (titleKey.includes(stdKey) || stdKey.includes(titleKey)) {
                return standardDays[stdKey];
            }
        }
    }

    const airDate = item.last_episode_air_date || item.first_air_date || item.release_date || "";
    if (airDate) {
        let day = new Date(airDate + "T00:00:00Z").getUTCDay();
        return day === 0 ? 7 : day;
    }

    return 0;
}

function computeAssetStats(items) {
  if (!Array.isArray(items)) return { posters: 0, noLogoPosters: 0, thumbs: 0, cleanBackdrops: 0, logos: 0 };
  let logos = 0, noLogoPosters = 0, cleanBackdrops = 0, posters = 0, thumbs = 0;
  items.forEach(i => {
    if (i.logo && !i.logo.includes('text_logo.svg')) logos++;
    if (i.noLogoPoster) noLogoPosters++;
    if (i.backdrop_path) cleanBackdrops++;
    if (i.poster_path) posters++;
    if (i.thumb) thumbs++;
  });
  return { logos, noLogoPosters, cleanBackdrops, posters, thumbs };
}

// ==========================================
// 8. 核心同步引擎
// ==========================================
async function executeSyncTask(categoryInput, env, limit = 100, quiet = false, reqCtx, originUrl, fetchLogo = true, fetchThumb = true) {
  let category = categoryInput;
  let targetDay = null;
  
  const match = categoryInput.match(/^(weekly_.*_collection)-(\d)$/);
  if (match) {
      category = match[1];
      targetDay = parseInt(match[2], 10);
  }

  const config = CATEGORY_MAP[category]; if (!config) throw new Error("未定义的分类");
  let processedData = [];

  const blacklist = await getBlacklist(env);

  let oldItemsList = [];
  try {
      if (category.endsWith("_collection")) {
          const daysToLoad = targetDay !== null ? [targetDay] : [1,2,3,4,5,6,7];
          for (let d of daysToLoad) {
              const fileKey = `${category}-${d}.json`;
              const oldObj = await env.R2_BUCKET.get(fileKey);
              if (oldObj !== null) {
                  const oldJson = await oldObj.json();
                  if (oldJson && oldJson.data) oldItemsList.push(...oldJson.data);
              }
          }
      } else {
          const oldObj = await env.R2_BUCKET.get(config.fileName);
          if (oldObj !== null) {
              const oldJson = await oldObj.json();
              if (oldJson && oldJson.data) oldItemsList.push(...oldJson.data);
          }
      }
  } catch (e) {}
  
  const oldDataHelper = buildOldDataHelper(oldItemsList);

  let newLogosTracker = [];
  const processOpts = (extra = {}) => ({ oldDataHelper, newLogosTracker, originUrl, fetchLogo, fetchThumb, ...extra });

  let overrides = {};
  try {
      const overrideObj = await env.R2_BUCKET.get("schedule-override.json");
      if (overrideObj) {
          overrides = await overrideObj.json();
      }
  } catch (e) {}

  const bgmCalendar = {};
  try {
      const bgmRes = await safeFetch('https://api.bgm.tv/calendar', { headers: { 'User-Agent': 'EPlayerX/1.0' } }, reqCtx);
      if (bgmRes.ok) {
          const bgmData = await bgmRes.json();
          bgmData.forEach(dayGroup => {
              let day = dayGroup.weekday.id; 
              const items = dayGroup.items || [];
              items.forEach(anime => {
                  const dayObj = { day };
                  if (anime.name) bgmCalendar[cleanAnimeTitle(anime.name)] = dayObj;
                  if (anime.name_cn) bgmCalendar[cleanAnimeTitle(anime.name_cn)] = dayObj;
              });
          });
      }
  } catch (e) {}

  if (category === "weekly_anime_collection") {
      const bgmRes = await safeFetch('https://api.bgm.tv/calendar', { headers: { 'User-Agent': 'EPlayerX/1.0' } }, reqCtx);
      const bgmData = bgmRes.ok ? await bgmRes.json() : [];
      
      let processedCount = 0;
      let allDayItems = [];
      for (let day = 1; day <= 7; day++) {
          if (targetDay !== null && day !== targetDay) continue; 
          
          let existingItems = [];
          try {
              const oldObj = await env.R2_BUCKET.get(`${category}-${day}.json`);
              if (oldObj) {
                  const oldJson = await oldObj.json();
                  if (oldJson && oldJson.data) existingItems = oldJson.data;
              }
          } catch(e) {}

          const dayData = bgmData.find(d => d.weekday.id === day);
          const rawItems = dayData ? dayData.items : [];
          let freshItems = [];
          for (const anime of rawItems) {
              const name = anime.name || "";
              const nameCn = anime.name_cn || "";
              
              if (/(仙逆|吞噬星空|完美世界|斗罗大陆|斗破苍穹|神印王座|武神主宰|师兄|修仙|百炼|大主宰|凡人修仙|遮天|沧元图|剑来|斩神)/.test(name + nameCn)) continue; 
              
              const checkItem = { title: nameCn || name };
              if (isItemBlacklisted(checkItem, blacklist, category)) continue;

              freshItems.push({ title: nameCn || name, searchQuery: name || nameCn, score: anime.rating?.score || 0 });
          }

          let combinedItems = deduplicateRawList([...existingItems, ...freshItems]);
          combinedItems = combinedItems.filter(item => !isItemBlacklisted(item, blacklist, category));

          if (combinedItems.length === 0) continue;

          let processedDayData = await processItemsWithTMDB(combinedItems, "tv", env, 100, processOpts({ isJapaneseAnimeOnly: true }), reqCtx);
          
          processedDayData = processedDayData.filter(item => !isItemBlacklisted(item, blacklist, category));
          processedCount += processedDayData.length;
          allDayItems.push(...processedDayData);
          
          const dayJson = { platform: "bangumi", type: "animation", count: processedDayData.length, lastUpdated: new Date().toISOString(), data: processedDayData };
          await env.R2_BUCKET.put(`${category}-${day}.json`, JSON.stringify(dayJson, null, 2), { httpMetadata: { contentType: "application/json" } });
      }

      if (targetDay === null) {
          const colJson = {
              id: category, preset: "collection-list", groupMode: "weekday",
              children: [1,2,3,4,5,6,7].map(d => ({ id: `${category}-${d}`, label: `周${["一","二","三","四","五","六","日"][d-1]}`, weekday: d, title: `周${["一","二","三","四","五","六","日"][d-1]}`, mediaType: "tv", preset: "poster-list", source: { path: `${originUrl}/blocks/public/${category}-${d}.json`, itemEnvelope: "data" } }))
          };
          await env.R2_BUCKET.put(`${category}.json`, JSON.stringify(colJson, null, 2), { httpMetadata: { contentType: "application/json" } });
      }
      return { count: processedCount, stats: computeAssetStats(allDayItems), newLogos: [] };
  }

  else if (category === "weekly_drama_collection") {
      let processedCount = 0;
      let allDayItems = [];
      for (let day = 1; day <= 7; day++) {
          if (targetDay !== null && day !== targetDay) continue; 
          
          let existingItems = [];
          try {
              const oldObj = await env.R2_BUCKET.get(`${category}-${day}.json`);
              if (oldObj) {
                  const oldJson = await oldObj.json();
                  if (oldJson && oldJson.data) existingItems = oldJson.data;
              }
          } catch(e) {}

          existingItems = existingItems.filter(item => !isItemBlacklisted(item, blacklist, category));
          if (existingItems.length === 0) {
              await env.R2_BUCKET.put(`${category}-${day}.json`, JSON.stringify({ platform: "tmdb", type: "tv_series", count: 0, lastUpdated: new Date().toISOString(), data: [] }, null, 2), { httpMetadata: { contentType: "application/json" } });
              continue; 
          }

          let processed = await processItemsWithTMDB(existingItems, "tv", env, limit, processOpts(), reqCtx);
          processed = processed.filter(item => !isItemBlacklisted(item, blacklist, category));
          processedCount += processed.length;
          allDayItems.push(...processed);
          
          const dayJson = { platform: "tmdb", type: "tv_series", count: processed.length, lastUpdated: new Date().toISOString(), data: processed };
          await env.R2_BUCKET.put(`${category}-${day}.json`, JSON.stringify(dayJson, null, 2), { httpMetadata: { contentType: "application/json" } });
      }

      if (targetDay === null) {
          const colJson = {
              id: category, preset: "collection-list", groupMode: "weekday",
              children: [1,2,3,4,5,6,7].map(d => ({ id: `${category}-${d}`, label: `周${["一","二","三","四","五","六","日"][d-1]}`, weekday: d, title: `周${["一","二","三","四","五","六","日"][d-1]}`, mediaType: "tv", preset: "poster-list", source: { path: `${originUrl}/blocks/public/${category}-${d}.json`, itemEnvelope: "data" } }))
          };
          await env.R2_BUCKET.put(`${category}.json`, JSON.stringify(colJson, null, 2), { httpMetadata: { contentType: "application/json" } });
      }
      return { count: processedCount, stats: computeAssetStats(allDayItems), newLogos: [] };
  }

  else if (category === "weekly_guoman_collection") {
      const standardDays = {};
      let processedCount = 0;
      let allDayItems = [];
      for (let day = 1; day <= 7; day++) {
          if (targetDay !== null && day !== targetDay) continue; 
          
          let existingItems = [];
          try {
              const oldObj = await env.R2_BUCKET.get(`${category}-${day}.json`);
              if (oldObj) {
                  const oldJson = await oldObj.json();
                  if (oldJson && oldJson.data) existingItems = oldJson.data;
              }
          } catch(e) {}

          let freshItems = [];
          for (const [name, d] of Object.entries(standardDays)) {
              if (d === day) freshItems.push({ title: name });
          }

          let combinedItems = deduplicateRawList([...existingItems, ...freshItems]);
          combinedItems = combinedItems.filter(item => !isItemBlacklisted(item, blacklist, category));
          if (combinedItems.length === 0) continue;

          let processed = await processItemsWithTMDB(combinedItems, "tv", env, limit, processOpts(), reqCtx);
          processed = processed.filter(item => !isItemBlacklisted(item, blacklist, category));
          processedCount += processed.length;
          allDayItems.push(...processed);
          
          const dayJson = { platform: "tmdb", type: "animation", count: processed.length, lastUpdated: new Date().toISOString(), data: processed };
          await env.R2_BUCKET.put(`${category}-${day}.json`, JSON.stringify(dayJson, null, 2), { httpMetadata: { contentType: "application/json" } });
      }

      if (targetDay === null) {
          const colJson = {
              id: category, preset: "collection-list", groupMode: "weekday",
              children: [1,2,3,4,5,6,7].map(d => ({ id: `${category}-${d}`, label: `周${["一","二","三","四","五","六","日"][d-1]}`, weekday: d, title: `周${["一","二","三","四","五","六","日"][d-1]}`, mediaType: "tv", preset: "poster-list", source: { path: `${originUrl}/blocks/public/${category}-${d}.json`, itemEnvelope: "data" } }))
          };
          await env.R2_BUCKET.put(`${category}.json`, JSON.stringify(colJson, null, 2), { httpMetadata: { contentType: "application/json" } });
      }
      return { count: processedCount, stats: computeAssetStats(allDayItems), newLogos: [] };
  }

  else if (category === "weekly_korean_drama_collection") {
      const now = new Date();
      const past60 = new Date(now.getTime() - 60 * 86400000).toISOString().substring(0, 10);
      const future30 = new Date(now.getTime() + 30 * 86400000).toISOString().substring(0, 10);

      const rawKr = await fetchTMDBDiscoverList('tv', { 
          with_original_language: 'ko', 
          without_genres: '16,10767,10763', 
          'air_date.gte': past60,
          'air_date.lte': future30,
          sort_by: 'popularity.desc' 
      }, env, 60, reqCtx).catch(() => []);

      let processedCount = 0;
      let allDayItems = [];
      for (let day = 1; day <= 7; day++) {
          if (targetDay !== null && day !== targetDay) continue;
          let existingItems = [];
          try {
              const oldObj = await env.R2_BUCKET.get(`${category}-${day}.json`);
              if (oldObj) { const oldJson = await oldObj.json(); if (oldJson && oldJson.data) existingItems = oldJson.data; }
          } catch(e) {}

          let freshItems = rawKr.filter(item => determineDay(item, null, null, overrides) === day);
          let combinedItems = deduplicateRawList([...existingItems, ...freshItems]);
          combinedItems = combinedItems.filter(item => !isItemBlacklisted(item, blacklist, category));
          if (combinedItems.length === 0) continue;

          let processed = await processItemsWithTMDB(combinedItems, "tv", env, limit, processOpts(), reqCtx);
          processed = processed.filter(item => !isItemBlacklisted(item, blacklist, category));
          processedCount += processed.length;
          allDayItems.push(...processed);
          const dayJson = { platform: "tmdb", type: "tv_series", count: processed.length, lastUpdated: new Date().toISOString(), data: processed };
          await env.R2_BUCKET.put(`${category}-${day}.json`, JSON.stringify(dayJson, null, 2), { httpMetadata: { contentType: "application/json" } });
      }

      if (targetDay === null) {
          const colJson = {
              id: category, preset: "collection-list", groupMode: "weekday",
              children: [1,2,3,4,5,6,7].map(d => ({ id: `${category}-${d}`, label: `周${["一","二","三","四","五","六","日"][d-1]}`, weekday: d, title: `周${["一","二","三","四","五","六","日"][d-1]}`, mediaType: "tv", preset: "poster-list", source: { path: `${originUrl}/blocks/public/${category}-${d}.json`, itemEnvelope: "data" } }))
          };
          await env.R2_BUCKET.put(`${category}.json`, JSON.stringify(colJson, null, 2), { httpMetadata: { contentType: "application/json" } });
      }
      return { count: processedCount, stats: computeAssetStats(allDayItems), newLogos: [] };
  }

  else if (category === "weekly_japanese_drama_collection") {
      const now = new Date();
      const past60 = new Date(now.getTime() - 60 * 86400000).toISOString().substring(0, 10);
      const future30 = new Date(now.getTime() + 30 * 86400000).toISOString().substring(0, 10);

      const rawJa = await fetchTMDBDiscoverList('tv', { 
          with_original_language: 'ja', 
          without_genres: '16,10767,10763', 
          'air_date.gte': past60,
          'air_date.lte': future30,
          sort_by: 'popularity.desc' 
      }, env, 60, reqCtx).catch(() => []);

      let processedCount = 0;
      let allDayItems = [];
      for (let day = 1; day <= 7; day++) {
          if (targetDay !== null && day !== targetDay) continue;
          let existingItems = [];
          try {
              const oldObj = await env.R2_BUCKET.get(`${category}-${day}.json`);
              if (oldObj) { const oldJson = await oldObj.json(); if (oldJson && oldJson.data) existingItems = oldJson.data; }
          } catch(e) {}

          let freshItems = rawJa.filter(item => determineDay(item, null, null, overrides) === day);
          let combinedItems = deduplicateRawList([...existingItems, ...freshItems]);
          combinedItems = combinedItems.filter(item => !isItemBlacklisted(item, blacklist, category));
          if (combinedItems.length === 0) continue;

          let processed = await processItemsWithTMDB(combinedItems, "tv", env, limit, processOpts(), reqCtx);
          processed = processed.filter(item => !isItemBlacklisted(item, blacklist, category));
          processedCount += processed.length;
          allDayItems.push(...processed);
          const dayJson = { platform: "tmdb", type: "tv_series", count: processed.length, lastUpdated: new Date().toISOString(), data: processed };
          await env.R2_BUCKET.put(`${category}-${day}.json`, JSON.stringify(dayJson, null, 2), { httpMetadata: { contentType: "application/json" } });
      }

      if (targetDay === null) {
          const colJson = {
              id: category, preset: "collection-list", groupMode: "weekday",
              children: [1,2,3,4,5,6,7].map(d => ({ id: `${category}-${d}`, label: `周${["一","二","三","四","五","六","日"][d-1]}`, weekday: d, title: `周${["一","二","三","四","五","六","日"][d-1]}`, mediaType: "tv", preset: "poster-list", source: { path: `${originUrl}/blocks/public/${category}-${d}.json`, itemEnvelope: "data" } }))
          };
          await env.R2_BUCKET.put(`${category}.json`, JSON.stringify(colJson, null, 2), { httpMetadata: { contentType: "application/json" } });
      }
      return { count: processedCount, stats: computeAssetStats(allDayItems), newLogos: [] };
  }

  else if (category === "weekly_sea_drama_collection") {
      const now = new Date();
      const past90 = new Date(now.getTime() - 90 * 86400000).toISOString().substring(0, 10);
      const future30 = new Date(now.getTime() + 30 * 86400000).toISOString().substring(0, 10);

      const rawSea = await fetchTMDBDiscoverList('tv', { 
          with_original_language: 'th|vi|id|tl', 
          without_genres: '16,10767,10763', 
          'air_date.gte': past90,
          'air_date.lte': future30,
          sort_by: 'popularity.desc' 
      }, env, 60, reqCtx).catch(() => []);

      let processedCount = 0;
      let allDayItems = [];
      for (let day = 1; day <= 7; day++) {
          if (targetDay !== null && day !== targetDay) continue;
          let existingItems = [];
          try {
              const oldObj = await env.R2_BUCKET.get(`${category}-${day}.json`);
              if (oldObj) { const oldJson = await oldObj.json(); if (oldJson && oldJson.data) existingItems = oldJson.data; }
          } catch(e) {}

          let freshItems = rawSea.filter(item => determineDay(item, null, null, overrides) === day);
          let combinedItems = deduplicateRawList([...existingItems, ...freshItems]);
          combinedItems = combinedItems.filter(item => !isItemBlacklisted(item, blacklist, category));
          if (combinedItems.length === 0) continue;

          let processed = await processItemsWithTMDB(combinedItems, "tv", env, limit, processOpts(), reqCtx);
          processed = processed.filter(item => !isItemBlacklisted(item, blacklist, category));
          processedCount += processed.length;
          allDayItems.push(...processed);
          const dayJson = { platform: "tmdb", type: "tv_series", count: processed.length, lastUpdated: new Date().toISOString(), data: processed };
          await env.R2_BUCKET.put(`${category}-${day}.json`, JSON.stringify(dayJson, null, 2), { httpMetadata: { contentType: "application/json" } });
      }

      if (targetDay === null) {
          const colJson = {
              id: category, preset: "collection-list", groupMode: "weekday",
              children: [1,2,3,4,5,6,7].map(d => ({ id: `${category}-${d}`, label: `周${["一","二","三","四","五","六","日"][d-1]}`, weekday: d, title: `周${["一","二","三","四","五","六","日"][d-1]}`, mediaType: "tv", preset: "poster-list", source: { path: `${originUrl}/blocks/public/${category}-${d}.json`, itemEnvelope: "data" } }))
          };
          await env.R2_BUCKET.put(`${category}.json`, JSON.stringify(colJson, null, 2), { httpMetadata: { contentType: "application/json" } });
      }
      return { count: processedCount, stats: computeAssetStats(allDayItems), newLogos: [] };
  }

  else if (category === "tmdb_popular_tv") { processedData = await processItemsWithTMDB(await fetchTMDBTrending('tv', env, limit, reqCtx), "tv", env, limit, processOpts(), reqCtx); }
  else if (category === "tmdb_popular_movies") { processedData = await processItemsWithTMDB(await fetchTMDBTrending('movie', env, limit, reqCtx), "movie", env, limit, processOpts(), reqCtx); }
  else if (category === "bangumi_airing") { let raw = await fetchBangumiCalendar(limit, reqCtx); processedData = await processItemsWithTMDB(raw, "tv", env, limit, processOpts(), reqCtx); }
  
  else if (category === "douban_tv" || category === "douban_tv_custom") { 
    let raw = await fetchDoubanSubjectCollection("tv_domestic", limit, reqCtx).catch(() => []); 
    if (!raw.length) raw = await fetchDoubanRecentHot("tv", { tag: "国产剧" }, limit, reqCtx).catch(() => []); 
    
    raw = raw.filter(item => {
      const t = item.title || "";
      return !/(动画|动漫|真人秀|脱口秀|演唱会|晚会|纪录片|特别节目|第[一二三四五六七八九十\d]+期|季|年番)/.test(t);
    });

    if (raw.length < limit) { 
      let tmdbCn = await fetchTMDBDiscoverList('tv', { 
        with_original_language: 'zh', 
        with_origin_country: 'CN', 
        without_genres: '16,10764,10767,10763,99', 
        sort_by: 'popularity.desc' 
      }, env, limit, reqCtx).catch(() => []); 
      raw = deduplicateRawList([...raw, ...tmdbCn]); 
    } 
    
    processedData = await processItemsWithTMDB(raw, "tv", env, limit, processOpts({ isDomesticDramaOnly: true }), reqCtx); 
  }

  else if (category === "imdb_top_anime") { processedData = await processItemsWithTMDB(await fetchTMDBDiscoverList('tv', { with_genres: '16', with_original_language: 'ja|zh', sort_by: 'vote_average.desc', 'vote_count.gte': '1000' }, env, limit, reqCtx), "tv", env, limit, processOpts(), reqCtx); }
  else if (category === "prime_hot_anime") { processedData = await processItemsWithTMDB(await fetchTMDBDiscoverList('tv', { with_watch_providers: '9', watch_region: 'JP', with_genres: '16', sort_by: 'popularity.desc' }, env, limit, reqCtx), "tv", env, limit, processOpts(), reqCtx); }
  else if (category === "filmarks_anime_movie") { processedData = await processItemsWithTMDB(await fetchTMDBDiscoverList('movie', { with_genres: '16', with_original_language: 'ja', sort_by: 'vote_average.desc', 'vote_count.gte': '200' }, env, limit, reqCtx), "movie", env, limit, processOpts(), reqCtx); }
  else if (category === "netflix_hot_anime") { processedData = await processItemsWithTMDB(await fetchTMDBDiscoverList('tv', { with_networks: '213', with_genres: '16', with_original_language: 'ja|zh', sort_by: 'popularity.desc' }, env, limit, reqCtx), "tv", env, limit, processOpts(), reqCtx); }
  else if (category === "tmdb_anime_top_ja") { processedData = await processItemsWithTMDB(await fetchTMDBDiscoverList('tv', { with_original_language: 'ja', with_genres: '16', sort_by: 'vote_average.desc', 'vote_count.gte': '500' }, env, limit, reqCtx), "tv", env, limit, processOpts(), reqCtx); }
  else if (category === "tmdb_anime_jp") { processedData = await processItemsWithTMDB(await fetchTMDBDiscoverList('tv', { with_original_language: 'ja', with_genres: '16' }, env, limit, reqCtx), "tv", env, limit, processOpts(), reqCtx); }
  else if (category === "tmdb_anime_movie_ja") { processedData = await processItemsWithTMDB(await fetchTMDBDiscoverList('movie', { with_original_language: 'ja', with_genres: '16' }, env, limit, reqCtx), "movie", env, limit, processOpts(), reqCtx); }
  else if (category === "tmdb_anime_cn") { processedData = await processItemsWithTMDB(await fetchTMDBDiscoverList('tv', { with_original_language: 'zh', with_genres: '16' }, env, limit, reqCtx), "tv", env, limit, processOpts(), reqCtx); }
  else if (category === "tmdb_tv_netflix") { processedData = await processItemsWithTMDB(await fetchTMDBDiscoverList('tv', { with_networks: '213' }, env, limit, reqCtx), "tv", env, limit, processOpts(), reqCtx); }
  else if (category === "tmdb_tv_hbo") { processedData = await processItemsWithTMDB(await fetchTMDBDiscoverList('tv', { with_networks: '49' }, env, limit, reqCtx), "tv", env, limit, processOpts(), reqCtx); }
  else if (category === "tmdb_tv_apple") { processedData = await processItemsWithTMDB(await fetchTMDBDiscoverList('tv', { with_networks: '2552' }, env, limit, reqCtx), "tv", env, limit, processOpts(), reqCtx); }
  else if (category === "douban_movies") { processedData = await processItemsWithTMDB(await fetchDoubanRecentHot("movie", { category: "热门", type: "华语" }, limit, reqCtx), "movie", env, limit, processOpts(), reqCtx); }
  else if (category === "variety_cn") {
    let rawCn = await fetchDoubanRecentHot("tv", { category: "show", type: "show_domestic" }, limit, reqCtx).catch(() => []);
    if (rawCn.length < limit) { let tmdbCn = await fetchTMDBDiscoverList('tv', { with_genres: '10764', with_original_language: 'zh', sort_by: 'popularity.desc' }, env, limit, reqCtx).catch(() => []); rawCn = [...rawCn, ...tmdbCn]; }
    processedData = await processItemsWithTMDB(rawCn, "tv", env, limit, processOpts(), reqCtx);
  }
  else if (category === "variety_kr") {
    const seeds = [{ title: "런닝맨", tmdbId: null }, { title: "아는 형님", tmdbId: null }, { title: "나 혼자 산다", tmdbId: null }, { title: "1박 2일", tmdbId: null }, { title: "환승연애", tmdbId: null }, { title: "놀라운 토요일", tmdbId: null }, { title: "유 퀴즈 온 더 블럭", tmdbId: null }];
    const tmdbKr = await fetchTMDBDiscoverList('tv', { with_genres: '10764', with_original_language: 'ko', sort_by: 'popularity.desc' }, env, limit, reqCtx).catch(() => []);
    let krList = [...seeds]; const seenKr = new Set(seeds.map(s => s.title));
    tmdbKr.forEach(item => { if (!seenKr.has(item.title)) { krList.push(item); seenKr.add(item.title); } });
    processedData = await processItemsWithTMDB(krList, "tv", env, limit, processOpts(), reqCtx);
  }
  else if (category === "variety_global") {
    const tmdbJaStream = await fetchTMDBDiscoverList('tv', { with_genres: '10764', with_original_language: 'ja', with_networks: '213|1024|2643', sort_by: 'popularity.desc' }, env, limit, reqCtx).catch(() => []);
    const tmdbJaRecent = await fetchTMDBDiscoverList('tv', { with_genres: '10764', with_original_language: 'ja', 'first_air_date.gte': '2022-01-01', sort_by: 'popularity.desc' }, env, limit, reqCtx).catch(() => []);
    const tmdbOthers = await fetchTMDBDiscoverList('tv', { with_genres: '10764', with_original_language: 'en|th|es|fr|de|id|tl|ms|vi', 'first_air_date.gte': '2022-01-01', sort_by: 'popularity.desc' }, env, limit, reqCtx).catch(() => []);
    let tmdbJa = [...tmdbJaStream]; const seenJa = new Set(tmdbJaStream.map(i => i.tmdbId));
    tmdbJaRecent.forEach(item => { if (!seenJa.has(item.tmdbId)) { tmdbJa.push(item); seenJa.add(item.tmdbId); } });
    let gbList = []; const seenGb = new Set();
    tmdbJa.slice(0, 15).forEach(i => { if (!seenGb.has(i.title)) { gbList.push(i); seenGb.add(i.title); } });
    const maxLen = Math.max(tmdbJa.length, tmdbOthers.length);
    for (let i = 0; i < maxLen; i++) {
      if (tmdbOthers[i] && !seenGb.has(tmdbOthers[i].title)) { 
        gbList.push(tmdbOthers[i]); 
        seenGb.add(tmdbOthers[i].title); 
      }
      if (i >= 15 && tmdbJa[i] && !seenGb.has(tmdbJa[i].title)) { 
        gbList.push(tmdbJa[i]); 
        seenGb.add(tmdbJa[i].title); 
      }
    }
    processedData = await processItemsWithTMDB(gbList, "tv", env, limit, processOpts(), reqCtx);
  }
  else if (category === "trakt_movies") { processedData = await processItemsWithTMDB(await fetchTraktTrending('movies', env, limit, reqCtx), "movie", env, limit, processOpts(), reqCtx); }
  else if (category === "trakt_shows") { processedData = await processItemsWithTMDB(await fetchTraktTrending('shows', env, limit, reqCtx), "tv", env, limit, processOpts(), reqCtx); }
  else if (category === "douban_korean_tv") { processedData = await processItemsWithTMDB(await fetchDoubanSubjectCollection("tv_korean", limit, reqCtx), "tv", env, limit, processOpts(), reqCtx); }
  else if (category === "tmdb_tv_ja") { processedData = await processItemsWithTMDB(await fetchTMDBDiscoverList('tv', { with_original_language: 'ja', without_genres: '16' }, env, limit, reqCtx), "tv", env, limit, processOpts(), reqCtx); }
  else if (category === "tmdb_tv_tw") { processedData = await processItemsWithTMDB(await fetchTMDBDiscoverList('tv', { with_original_language: 'zh', with_origin_country: 'TW', sort_by: 'popularity.desc', 'first_air_date.gte': '2021-01-01', 'vote_count.gte': '5' }, env, limit, reqCtx), "tv", env, limit, processOpts(), reqCtx); }
  else if (category === "tmdb_movie_tw") { processedData = await processItemsWithTMDB(await fetchTMDBDiscoverList('movie', { with_original_language: 'zh', with_origin_country: 'TW', sort_by: 'popularity.desc', 'primary_release_date.gte': '2021-01-01', 'vote_count.gte': '5' }, env, limit, reqCtx), "movie", env, limit, processOpts(), reqCtx); }
  else if (category === "tmdb_movie_hk_erotic_comedy") {
    const [level3Comedies, sexComedies, keywordErotics] = await Promise.all([
      fetchTMDBDiscoverList('movie', { certification_country: 'HK', certification: 'III', with_origin_country: 'HK', without_genres: '27,53,16,28', sort_by: 'popularity.desc', include_adult: 'true' }, env, limit, reqCtx).catch(() => []),
      fetchTMDBDiscoverList('movie', { with_origin_country: 'HK', with_genres: '35', with_keywords: '232252|155554|15003|10556|10123|1574|10006', without_genres: '27,53,16', sort_by: 'popularity.desc', include_adult: 'true' }, env, limit, reqCtx).catch(() => []),
      fetchTMDBDiscoverList('movie', { with_origin_country: 'HK', with_keywords: '12053|10006|1574', without_genres: '27,53,16,28', sort_by: 'vote_count.desc', include_adult: 'true' }, env, limit, reqCtx).catch(() => [])
    ]);
    const baseSeeds = [
      "飞虎出征", "大丈夫", "大丈夫2", "低俗喜剧", "一路向西", "鸭王", "鸭王2", "夜王",
      "喜爱夜蒲", "喜爱夜蒲2", "喜爱夜蒲3", "台北夜蒲团团转", "私人会所", "#PTGF出租女友",
      "微交少女", "同班同学", "雏妓", "重口味", "AV青春梦工场", "破事儿", "老笠",
      "西谎极落之太爆太子太空舱", "豪情", "豪情3D", "金鸡", "金鸡2", "金鸡SSS",
      "绝世好Bra", "绝世好B", "恋上你的床", "买凶拍人", "鹿鼎记", "情圣", "最佳损友",
      "精装追女仔", "求爱敢死队", "玉蒲团之偷情宝鉴", "玉女心经", "3D肉蒲团之极乐宝鉴",
      "蜜桃成熟时", "蜜桃成熟时1997", "色情男女", "满清十大酷刑", "青楼十二房", "挡不住的疯情"
    ].map(t => ({ title: t, tmdbId: null, popularity: 999 }));
    const allDynamicData = [...baseSeeds, ...level3Comedies, ...sexComedies, ...keywordErotics];
    const seen = new Map();
    allDynamicData.forEach(item => { const key = item.tmdbId ? item.tmdbId.toString() : item.title; if (!seen.has(key)) seen.set(key, item); });
    let pureDynamicList = Array.from(seen.values());
    pureDynamicList.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    processedData = await processItemsWithTMDB(pureDynamicList, "movie", env, limit, processOpts({ include_adult: "true" }), reqCtx);
  }
  else if (category === "tmdb_tv_th") { processedData = await processItemsWithTMDB(await fetchTMDBDiscoverList('tv', { with_original_language: 'th' }, env, limit, reqCtx), "tv", env, limit, processOpts(), reqCtx); }
  else if (category === "tmdb_movie_th") { processedData = await processItemsWithTMDB(await fetchTMDBDiscoverList('movie', { with_original_language: 'th' }, env, limit, reqCtx), "movie", env, limit, processOpts(), reqCtx); }
  else if (category === "tmdb_movie_sea") { 
    const [vivamax, keywordErotics, seaRomance] = await Promise.all([
      fetchTMDBDiscoverList('movie', { with_companies: '342|125178', with_original_language: 'tl', without_genres: '27,16,10751,9648', sort_by: 'popularity.desc', include_adult: 'true' }, env, Math.floor(limit/2), reqCtx).catch(() => []),
      fetchTMDBDiscoverList('movie', { with_original_language: 'tl|id|vi|ms|th|lo|km', with_keywords: '10006|1574|12053|232252|155554', without_genres: '27,16,10751,9648', sort_by: 'popularity.desc', include_adult: 'true' }, env, Math.floor(limit/2), reqCtx).catch(() => []),
      fetchTMDBDiscoverList('movie', { with_original_language: 'tl|id|vi|ms|th|lo|km', with_genres: '10749|18', without_genres: '27,16,10751,9648,28,12,878,14,35,99', sort_by: 'popularity.desc', include_adult: 'true' }, env, limit, reqCtx).catch(() => [])
    ]);
    const allData = [...vivamax, ...keywordErotics, ...seaRomance].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    const seen = new Map();
    allData.forEach(item => { if (!seen.has(item.tmdbId)) seen.set(item.tmdbId, item); });
    let pureList = Array.from(seen.values());
    const blacklistWords = ["心犬相随", "致我的青春", "Dear Jo", "Puppy", "Dog"];
    pureList = pureList.filter(item => { const title = (item.title || "").toLowerCase(); return !blacklistWords.some(b => title.includes(b.toLowerCase())); });
    processedData = await processItemsWithTMDB(pureList, "movie", env, limit, processOpts({ include_adult: "true" }), reqCtx);
  }
  else if (category === "tmdb_tv_es") { processedData = await processItemsWithTMDB(await fetchTMDBDiscoverList('tv', { with_original_language: 'es' }, env, limit, reqCtx), "tv", env, limit, processOpts(), reqCtx); }
  else if (category === "netflix_tv_minor") { processedData = await processItemsWithTMDB(await fetchTMDBDiscoverList('tv', { with_networks: '213', with_original_language: 'fr|de|it|pt|ru|tr|sv|nl|no|da|fi|pl|id|ar|he|cs', sort_by: 'popularity.desc' }, env, limit, reqCtx), "tv", env, limit, processOpts(), reqCtx); }
  else if (category === "netflix_movie_minor") { processedData = await processItemsWithTMDB(await fetchTMDBDiscoverList('movie', { with_original_language: 'fr|de|it|pt|ru|tr|sv|nl|no|da|fi|pl|id|ar|he|cs', sort_by: 'popularity.desc', 'vote_count.gte': '100' }, env, limit, reqCtx), "movie", env, limit, processOpts(), reqCtx); }
  else if (category === "tmdb_tv_bl") {
    const GAGA_2025_SEEDS = [{ title: "Revenged Love" }, { title: "Desire" }, { title: "Secret Lover" }, { title: "Doctor's Mine" }, { title: "Chase Game" }, { title: "School Trip Joined a Group" }, { title: "Fragrance of the First Flower" }, { title: "Love in the Air" }, { title: "Cosmetic Playlover" }, { title: "Takara's Treasure" }, { title: "Fujimi Orchestra" }, { title: "Although I Love You And You" }, { title: "Candy Color Paradox" }, { title: "Semantic Error" }, { title: "Love For Love's Sake" }];
    const [blKeyword, yaoiKeyword, bromanceTh, bromanceKoZh, gmmNetwork] = await Promise.all([
      fetchTMDBDiscoverList('tv', { with_keywords: '155201', sort_by: 'popularity.desc', without_genres: '16' }, env, 20, reqCtx),
      fetchTMDBDiscoverList('tv', { with_keywords: '210672', with_original_language: 'ja', sort_by: 'popularity.desc', without_genres: '16' }, env, 20, reqCtx),
      fetchTMDBDiscoverList('tv', { with_keywords: '9748', with_original_language: 'th', sort_by: 'popularity.desc', without_genres: '16' }, env, 20, reqCtx),
      fetchTMDBDiscoverList('tv', { with_keywords: '9748', with_original_language: 'ko|zh', sort_by: 'popularity.desc', without_genres: '16' }, env, 20, reqCtx),
      fetchTMDBDiscoverList('tv', { with_networks: '2091', sort_by: 'popularity.desc', without_genres: '16' }, env, 20, reqCtx)
    ]);
    const allData = [...blKeyword, ...yaoiKeyword, ...bromanceTh, ...bromanceKoZh, ...gmmNetwork].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    const seen = new Map();
    allData.forEach(item => { if (item.origin_country && item.origin_country.includes('CN')) return; if (!seen.has(item.tmdbId)) seen.set(item.tmdbId, item); });
    let pureList = Array.from(seen.values());
    if (pureList.length < 15) { pureList = [...pureList, ...GAGA_2025_SEEDS]; }
    processedData = await processItemsWithTMDB(pureList, "tv", env, limit, processOpts(), reqCtx);
  }

  if (Array.isArray(processedData)) {
      processedData = processedData.filter(item => !isItemBlacklisted(item, blacklist, category));
  }

  if (processedData.length === 0 && targetDay === null) throw new Error("TMDB未能匹配到任何符合条件的影视数据");

  if (!category.endsWith("_collection")) {
      let combinedData = deduplicateByTmdbId([...processedData, ...oldItemsList]);
      combinedData = combinedData.filter(item => !isItemBlacklisted(item, blacklist, category)).slice(0, limit);

      if (combinedData.length < 25 && oldItemsList.length >= 25) {
          return { count: oldItemsList.length, stats: computeAssetStats(oldItemsList), newLogos: [] };
      }

      const finalJson = { platform: config.platform, type: config.type, count: combinedData.length, lastUpdated: new Date().toISOString(), data: combinedData };
      await env.R2_BUCKET.put(config.fileName, JSON.stringify(finalJson, null, 2), { httpMetadata: { contentType: "application/json" } });
      
      const stats = computeAssetStats(combinedData);
      
      if (!quiet && env.TG_BOT_TOKEN && env.TG_CHAT_ID) {
        const catName = config.name || category;
        const tgReport = `🚀 <b>[单次定向同步] 执行完毕</b>\n` +
                         `═══════════════════\n` +
                         `📋 <b>目标榜单</b>: ${catName}\n` +
                         `📊 <b>大盘总数</b>: <b>${finalJson.count}</b> 部\n\n` +
                         `✨ <b>五维资产入库明细:</b>\n` +
                         `▪️ 💎 真实Logo: <b>${stats.logos}</b> / ${finalJson.count}\n` +
                         `▪️ 🎴 无字竖图: <b>${stats.noLogoPosters}</b> / ${finalJson.count}\n` +
                         `▪️ 🎬 无字横屏: <b>${stats.cleanBackdrops}</b> / ${finalJson.count}\n` +
                         `▪️ 📇 正标海报: <b>${stats.posters}</b> / ${finalJson.count}\n` +
                         `▪️ 📺 横版剧照: <b>${stats.thumbs}</b> / ${finalJson.count}`;
        await sendTgMessage(env, tgReport);
      }

      return { count: finalJson.count, stats, newLogos: newLogosTracker };
  }
}

function buildTgMenu(mask) {
  if (typeof mask !== 'bigint') mask = BigInt(mask);
  let inline_keyboard = [];
  let row = [];
  for (let i = 0; i < CATEGORY_CONFIGS.length; i++) {
    let isSelected = (mask & (1n << BigInt(i))) !== 0n;
    let text = `${isSelected ? '✅' : '⬜️'} ${CATEGORY_CONFIGS[i].name.substring(0, 9)}`;
    row.push({ text: text, callback_data: `tg:${mask.toString(16)}:${i}` });
    if (row.length === 2) { inline_keyboard.push(row); row = []; }
  }
  if (row.length > 0) inline_keyboard.push(row);
  inline_keyboard.push([
    { text: "✅ 全选", callback_data: `tsa` },
    { text: "❌ 清空", callback_data: `tsn` }
  ]);
  if (mask > 0n) {
    inline_keyboard.push([{ text: "▶️ 下一步：开始执行抓取", callback_data: `run:${mask.toString(16)}` }]);
  }
  return inline_keyboard;
}

function isAdmin(request, env) {
  const auth = request.headers.get("Authorization");
  if (!auth) return false;
  const token = auth.replace("Bearer ", "");
  return (env.ADMIN_SECRET && token === env.ADMIN_SECRET) || (env.SYNC_SECRET && token === env.SYNC_SECRET);
}

// 🌟 4. 后端推送时终极拦截锁：无论前端传递什么，只要不是 hero-list 全部锁定为 poster-list
function incrementalMergeConfigTs(existingText, selectedCats, fallbackOriginUrl, fallbackTsCode) {
  if (!existingText || (!existingText.includes("createV2BlockTemplates") && !existingText.includes("createDefaultBlockTemplates"))) {
    return fallbackTsCode;
  }

  let updatedText = existingText;
  const myR2 = "https://r2.eplayerx.cc.cd";

  if (updatedText.includes("HOME_CONFIG_VERSION = 1")) {
    updatedText = updatedText.replace("export const HOME_CONFIG_VERSION = 1;", "export const HOME_CONFIG_V2_VERSION = 2;");
  }

  function findBlockBounds(text, blockId) {
    const idRegex = new RegExp(`id:\\s*["']${blockId}["']`);
    const match = idRegex.exec(text);
    if (!match) return null;

    const idPos = match.index;
    let openBracePos = -1;
    let depth = 0;
    
    for (let i = idPos; i >= 0; i--) {
      if (text[i] === '}') depth++;
      else if (text[i] === '{') {
        if (depth === 0) { openBracePos = i; break; }
        else { depth--; }
      }
    }
    if (openBracePos === -1) return null;

    depth = 0;
    let closeBracePos = -1;
    for (let i = openBracePos; i < text.length; i++) {
      if (text[i] === '{') depth++;
      else if (text[i] === '}') {
        depth--;
        if (depth === 0) { closeBracePos = i; break; }
      }
    }
    if (closeBracePos === -1) return null;

    return { start: openBracePos, end: closeBracePos + 1 };
  }

  const allCmsCatIds = CATEGORY_CONFIGS.map(c => c.id);
  const selectedCatIds = new Set(selectedCats.map(c => c.id));
  const unselectedCmsCatIds = allCmsCatIds.filter(id => !selectedCatIds.has(id));

  for (const unselectedId of unselectedCmsCatIds) {
    const bounds = findBlockBounds(updatedText, unselectedId);
    if (bounds) {
      let start = bounds.start;
      let end = bounds.end;
      while (end < updatedText.length) {
        if (updatedText[end] === ',') { end++; break; }
        if (updatedText[end] !== ' ' && updatedText[end] !== '\n' && updatedText[end] !== '\r' && updatedText[end] !== '\t') break;
        end++;
      }
      updatedText = updatedText.substring(0, start) + updatedText.substring(end);
    }
  }

  for (const c of selectedCats) {
    let newBlockCode = "";
    const catCfg = CATEGORY_CONFIGS.find(cfg => cfg.id === c.id);
    const fileName = catCfg ? catCfg.fileName : `${c.id}.json`;
    
    // 🌟 后端终极拦截：无论前端传什么，只要不是 hero-list 全部锁定为 poster-list
    const safePreset = (c.currentPreset === 'hero-list') ? 'hero-list' : 'poster-list';

    if (c.isCollection) {
      // 🌟 推送到 GitHub 前自动清理国旗 Emoji 以及 (合集) 后缀
      const cleanTitle = (c.name || '').replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF]/g, '').replace(/\s*[(（].*?[)）]\s*/g, '').trim();
      newBlockCode = `    {\n      id: "${c.id}",\n      title: "${cleanTitle}",\n      mediaType: "${c.type}",\n      preset: COLLECTION_PRESET,\n      style: "image-landscape",\n      groupMode: "weekday",\n      children: [1, 2, 3, 4, 5, 6, 7].map(d => ({\n        id: \`${c.id}-\${d}\`,\n        label: \`周\${["一", "二", "三", "四", "五", "六", "日"][d - 1]}\`,\n        weekday: d,\n        title: \`周\${["一", "二", "三", "四", "五", "六", "日"][d - 1]}\`,\n        mediaType: "${c.type}",\n        preset: "poster-list",\n        source: { path: \`${myR2}/${c.id}-\${d}.json\`, itemEnvelope: "data" }\n      }))\n    } as unknown as HomeBlockTemplate`;
    } else {
      const returnArrRegex = /(function\s+createV2BlockTemplates[\s\S]*?return\s*\[)([\s\S]*?)(\];)/;
      const match = updatedText.match(returnArrRegex);
      if (match) {
        let innerArray = match[2].trim();
        let cleanInner = innerArray.replace(/,\s*$/, '');
        let newInner = cleanInner 
          ? `${cleanInner},\n${newBlockCode}`
          : `\n${newBlockCode}\n  `;
        updatedText = updatedText.replace(returnArrRegex, `$1\n${newInner}\n$3`);
      }
    }
  }

  updatedText = updatedText.replace(/,\s*,/g, ',');
  updatedText = updatedText.replace(/\[\s*,/g, '[');
  updatedText = updatedText.replace(/,\s*\]/g, ']');

  return updatedText;
}

// ==========================================
// 9. Cloudflare Worker 主入口与路由响应
// ==========================================
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/") return new Response(FRONTEND_HTML, { headers: { "Content-Type": "text/html;charset=UTF-8" } });

    const antiCacheHeaders = { 
      "Access-Control-Allow-Origin": "*", 
      "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS", 
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Cron-Auth",
      "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0, s-maxage=0",
      "Pragma": "no-cache",
      "Expires": "0"
    };

    if (request.method === "OPTIONS") return new Response(null, { headers: antiCacheHeaders });

    const pathParts = url.pathname.split('/').filter(Boolean);
    const action = pathParts[0];
    const category = pathParts[1];

    if (action === "api" && category === "test_cron") {
      try {
        const result = await this.runCronLogic(env, ctx, "【手动浏览器触发】", true);
        return new Response(JSON.stringify({ success: true, debug: result }, null, 2), {
          headers: { "Content-Type": "application/json;charset=UTF-8", ...antiCacheHeaders }
        });
      } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message, stack: err.stack }, null, 2), {
          status: 500, headers: { "Content-Type": "application/json;charset=UTF-8", ...antiCacheHeaders }
        });
      }
    }

    if (action === "api" && category === "cron_status" && request.method === "GET") {
      if (!env.R2_BUCKET) return new Response("{}", { headers: antiCacheHeaders });
      const obj = await env.R2_BUCKET.get("cron_state.json");
      if (obj === null) return new Response(JSON.stringify({ status: "IDLE", isPaused: false, autoStartHour: 3 }), { headers: { "Content-Type": "application/json", ...antiCacheHeaders } });
      return new Response(obj.body, { headers: { "Content-Type": "application/json", ...antiCacheHeaders } });
    }

    if (action === "action" && category === "toggle_cron" && request.method === "POST") {
      if (!isAdmin(request, env)) return new Response(JSON.stringify({ success: false, error: "越权！" }), { status: 403, headers: antiCacheHeaders });
      try {
        const body = await request.json();
        let state = { currentIndex: 0, cycleCount: 1, isPaused: false, autoStartHour: 3 };
        if (env.R2_BUCKET) {
          const oldObj = await env.R2_BUCKET.get("cron_state.json");
          if (oldObj) state = await oldObj.json();
          state.isPaused = !!body.paused;
          await env.R2_BUCKET.put("cron_state.json", JSON.stringify(state, null, 2), { httpMetadata: { contentType: "application/json" } });
        }
        return new Response(JSON.stringify({ success: true, isPaused: state.isPaused }), { headers: { "Content-Type": "application/json", ...antiCacheHeaders } });
      } catch (e) {
        return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500, headers: antiCacheHeaders });
      }
    }

    if (action === "action" && category === "start_cron_now" && request.method === "POST") {
      if (!isAdmin(request, env)) return new Response(JSON.stringify({ success: false, error: "越权！" }), { status: 403, headers: antiCacheHeaders });
      try {
        const result = await this.runCronLogic(env, ctx, "【管理员手动立即触发】", true);
        return new Response(JSON.stringify({ success: true, message: "🚀 全量同步周期已启动！", data: result }), {
          headers: { "Content-Type": "application/json;charset=UTF-8", ...antiCacheHeaders }
        });
      } catch (e) {
        return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500, headers: antiCacheHeaders });
      }
    }

    if (action === "action" && category === "set_cron_time" && request.method === "POST") {
      if (!isAdmin(request, env)) return new Response(JSON.stringify({ success: false, error: "越权！" }), { status: 403, headers: antiCacheHeaders });
      try {
        const body = await request.json();
        const setHour = parseInt(body.hour, 10);
        let state = { autoStartHour: 3 };
        if (env.R2_BUCKET) {
          const oldObj = await env.R2_BUCKET.get("cron_state.json");
          if (oldObj) state = await oldObj.json();
          state.autoStartHour = isNaN(setHour) ? 3 : setHour;
          state.lastRunDate = null;
          await env.R2_BUCKET.put("cron_state.json", JSON.stringify(state, null, 2), { httpMetadata: { contentType: "application/json" } });
        }
        return new Response(JSON.stringify({ success: true, autoStartHour: state.autoStartHour }), { 
          headers: { "Content-Type": "application/json;charset=UTF-8", ...antiCacheHeaders } 
        });
      } catch (e) {
        return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500, headers: antiCacheHeaders });
      }
    }

    if (url.pathname.startsWith("/blocks/public/")) {
      if (!env.R2_BUCKET) return new Response(JSON.stringify({ error: "R2未绑定" }), { status: 500, headers: antiCacheHeaders });
      const fileName = url.pathname.substring("/blocks/public/".length); 
      const object = await env.R2_BUCKET.get(fileName);
      if (object === null) {
          return new Response(JSON.stringify({ count: 0, data: [] }), { headers: { "Content-Type": "application/json;charset=UTF-8", ...antiCacheHeaders } });
      }
      return new Response(await object.text(), { headers: { "Content-Type": "application/json;charset=UTF-8", ...antiCacheHeaders } });
    }

    if (action === "api" && category === "text_logo.svg" && request.method === "GET") {
      const text = url.searchParams.get("text") || "未知名称";
      const width = 800;
      const height = 450;
      let textLen = 0;
      for (let i = 0; i < text.length; i++) {
          textLen += text.charCodeAt(i) > 255 ? 1 : 0.55;
      }
      const fontSize = 115;
      const estWidth = textLen * fontSize;
      let line1 = text;
      let line2 = "";
      if (estWidth > 760) {
          const mid = Math.ceil(text.length / 2);
          line1 = text.substring(0, mid);
          line2 = text.substring(mid);
      }
      const esc = (str) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
      line1 = esc(line1);
      line2 = esc(line2);

      let textElements = `<text x="400" y="${line2 ? 300 : 430}" text-anchor="middle" fill="#ffffff" stroke="#ffffff" stroke-width="3" stroke-linejoin="round" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif" font-size="${fontSize}" font-weight="900" dominant-baseline="alphabetic">${line1}</text>`;
      if (line2) {
          textElements += `\n          <text x="400" y="430" text-anchor="middle" fill="#ffffff" stroke="#ffffff" stroke-width="3" stroke-linejoin="round" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif" font-size="${fontSize}" font-weight="900" dominant-baseline="alphabetic">${line2}</text>`;
      }

      const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
          <defs><style>@import url('https://fonts.googleapis.com/css2?family=Inter:wght=900&amp;display=swap');</style></defs>
          ${textElements}
      </svg>`;
      return new Response(svgString, { headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=604800, immutable", ...antiCacheHeaders } });
    }

    if (action === "api" && category === "tg_webhook" && request.method === "POST") {
      try {
        const body = await request.json();

        if (body.message && body.message.chat && body.message.text) {
          const chatId = body.message.chat.id.toString();
          const text = body.message.text;

          if (env.TG_CHAT_ID && chatId !== env.TG_CHAT_ID.toString()) return new Response("OK", { status: 200 });

          if (text.startsWith('/start') || text.startsWith('/ping')) {
            const reply = `🤖 <b>EPlayerX 大总管为您服务！</b>\n\n您的 Chat ID 是：<code>${chatId}</code>\n\n🎯 请直接在对话框输入 <b>/sync</b> 即可唤出数据控制面板，支持自定义多选批量拉取更新！`;
            ctx.waitUntil(sendTgMessage({ ...env, TG_CHAT_ID: chatId }, reply));
          }
          else if (text.startsWith('/sync')) {
            const inline_keyboard = buildTgMenu(0n);
            ctx.waitUntil((async () => {
              await fetch("https://api.telegram.org/bot" + env.TG_BOT_TOKEN + "/sendMessage", {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: chatId, text: "🎯 <b>请勾选您需要更新的榜单：</b>", parse_mode: 'HTML', reply_markup: { inline_keyboard } })
              });
            })());
          }
        }

        if (body.callback_query) {
          const cb = body.callback_query;
          const chatId = cb.message.chat.id.toString();
          const cbData = cb.data;

          if (env.TG_CHAT_ID && chatId !== env.TG_CHAT_ID.toString()) return new Response("OK", { status: 200 });

          if (cbData.startsWith("tg:") || cbData === "tsa" || cbData === "tsn" || cbData === "sync") {
            let mask = 0n;
            if (cbData.startsWith("tg:")) {
              const parts = cbData.split(":");
              mask = BigInt("0x" + parts[1]);
              mask ^= (1n << BigInt(parts[2]));
            } else if (cbData === "tsa") { mask = ALL_MASK; }
            else if (cbData === "tsn" || cbData === "sync") { mask = 0n; }

            fetch("https://api.telegram.org/bot" + env.TG_BOT_TOKEN + "/answerCallbackQuery", {
              method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ callback_query_id: cb.id })
            });

            const inline_keyboard = buildTgMenu(mask);
            ctx.waitUntil((async () => {
              await fetch("https://api.telegram.org/bot" + env.TG_BOT_TOKEN + "/editMessageText", {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: chatId, message_id: cb.message.message_id, text: "🎯 <b>请勾选您需要更新的榜单：</b>", parse_mode: 'HTML', reply_markup: { inline_keyboard } })
              });
            })());
          }
          else if (cbData.startsWith("run:")) {
            const parts = cbData.split(":");
            const mask = BigInt("0x" + parts[1]);

            let indices = [];
            for (let i = 0; i < CATEGORY_CONFIGS.length; i++) { if ((mask & (1n << BigInt(i))) !== 0n) indices.push(i); }

            fetch("https://api.telegram.org/bot" + env.TG_BOT_TOKEN + "/answerCallbackQuery", {
              method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ callback_query_id: cb.id, text: `开始调度！检测到 ${indices.length} 个任务...` })
            });

            ctx.waitUntil((async () => {
              let msgId = cb.message.message_id;
              const reqCtx = { subreqs: 0, maxSubreqs: 48, isSafeMode: indices.length > 1, clearCooldown: false };
              const safeLimit = indices.length > 3 ? 40 : 100;

              let header = `🚀 <b>自选列队同步执行中 [单榜最高:${safeLimit}条]</b>\n`;
              if (reqCtx.isSafeMode) header += `🛡️ <i>多选模式开启，已成型的影片自动跳过不耗额度！</i>\n\n`;

              let statuses = indices.map(idx => `⏳ 待命: ${CATEGORY_CONFIGS[idx].name}`);
              await editTgMessage(env, chatId, msgId, header + statuses.join('\n'), reqCtx);

              let completedCount = 0;
              let isAbortedByLimit = false;

              for (let i = 0; i < indices.length; i++) {
                let idx = indices[i];
                let catId = CATEGORY_CONFIGS[idx].id;

                if (reqCtx.subreqs >= reqCtx.maxSubreqs - 18) {
                  isAbortedByLimit = true;
                  break;
                }

                statuses[i] = `🔄 <b>扫描中:</b> ${CATEGORY_CONFIGS[idx].name}...`;
                await editTgMessage(env, chatId, msgId, header + statuses.join('\n'), reqCtx);

                try {
                  const currentOrigin = new URL(request.url).origin;
                  let fetched = await executeSyncTask(catId, env, safeLimit, true, reqCtx, currentOrigin, true, true);
                  const st = (fetched && fetched.stats) ? fetched.stats : { logos: 0, noLogoPosters: 0, cleanBackdrops: 0, posters: 0, thumbs: 0 };
                  const sLogos = st['logos'] || 0;
                  const sNoLogoPosters = st['noLogoPosters'] || 0;
                  const sCleanBackdrops = st['cleanBackdrops'] || 0;
                  statuses[i] = "✅ <b>" + escapeHTML(CATEGORY_CONFIGS[idx].name) + "</b> (共" + fetched.count + "部 | 💎标:" + sLogos + " | 🎴无字竖:" + sNoLogoPosters + " | 🎬无字横:" + sCleanBackdrops + ")";
                } catch(e) {
                  if (e.message === "CF_LIMIT") { isAbortedByLimit = true; break; }
                  statuses[i] = `❌ <b>失败:</b> ${escapeHTML(CATEGORY_CONFIGS[idx].name)}`;
                }
                completedCount++;
              }

              if (isAbortedByLimit && completedCount < indices.length) {
                let remainingIndices = indices.slice(completedCount);
                let nextMask = 0n;
                for (let idx of remainingIndices) nextMask |= (1n << BigInt(idx));
                header = `⚠️ <b>触发 CF 并发安全红线，已自动安全悬停！</b>\n`;
                header += `✅ 成功同步了这批 ${completedCount} 个榜单的数据\n`;
                header += `👇 <i>因为免费算力限制，请点击下方按钮【无缝继续同步剩余的榜单】</i>\n\n`;
                const inline_keyboard = [[{ text: `▶️ 继续无缝续传剩余的 ${remainingIndices.length} 个榜单`, callback_data: `run:${nextMask.toString(16)}` }]];
                await editTgMessage(env, chatId, msgId, header + statuses.join('\n'), reqCtx, { inline_keyboard });
              } else {
                header = `🎉 <b>自选同步任务全部完毕！</b>\n`;
                header += `⚠️ <i>共消耗 CF 外部请求额度: ${reqCtx.subreqs} 次</i>\n\n`;
                await editTgMessage(env, chatId, msgId, header + statuses.join('\n'), reqCtx);
              }
            })());
          }
        }
        return new Response("OK", { status: 200, headers: antiCacheHeaders });
      } catch(e) { return new Response("OK", { status: 200, headers: antiCacheHeaders }); }
    }

    if (action === "api" && category === "login" && request.method === "POST") {
      if (isAdmin(request, env)) return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json", ...antiCacheHeaders } });
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: antiCacheHeaders });
    }

    if (action === "api" && category === "schedule_override" && request.method === "GET") {
      if (!env.R2_BUCKET) return new Response("{}", { headers: antiCacheHeaders });
      const obj = await env.R2_BUCKET.get("schedule-override.json");
      if (obj === null) return new Response("{}", { headers: { "Content-Type": "application/json", ...antiCacheHeaders } });
      return new Response(obj.body, { headers: { "Content-Type": "application/json", ...antiCacheHeaders } });
    }

    if (action === "action" && category === "direct_inject" && request.method === "POST") {
        if (!isAdmin(request, env)) return new Response(JSON.stringify({ success: false, error: "越权！" }), { status: 403, headers: antiCacheHeaders });
        try {
            const body = await request.json();
            const { items, category: catId } = body;
            
            if (!items || Object.keys(items).length === 0) return new Response(JSON.stringify({ success: false, error: "未提供数据" }), { status: 400, headers: antiCacheHeaders });
            
            let config = CATEGORY_MAP[catId];
            if (!config && !catId.endsWith("_collection")) return new Response(JSON.stringify({ success: false, error: "无效的分类" }), { status: 400, headers: antiCacheHeaders });
            
            const fctx = { subreqs: 0, maxSubreqs: 9999, isSafeMode: false, clearCooldown: true };
            const currentOrigin = new URL(request.url).origin;
            const processOpts = { oldDataHelper: buildOldDataHelper([]), newLogosTracker: [], originUrl: currentOrigin, fetchLogo: true, fetchThumb: true };

            let injectedCount = 0;
            const daysMap = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] };
            
            for (const [key, dayValue] of Object.entries(items)) {
                let days = Array.isArray(dayValue) ? dayValue : [dayValue];
                days.forEach(d => {
                    const dayInt = parseInt(d, 10);
                    if (dayInt >= 1 && dayInt <= 7) {
                        if (/^\d+$/.test(key)) daysMap[dayInt].push({ tmdbId: parseInt(key, 10), title: "ID:" + key });
                        else daysMap[dayInt].push({ title: key });
                    }
                });
            }

            for (let day = 1; day <= 7; day++) {
                const daySeeds = daysMap[day];
                if (daySeeds.length === 0) continue;

                const processed = await processItemsWithTMDB(daySeeds, "tv", env, daySeeds.length, processOpts, fctx);
                if (processed.length === 0) continue;

                let fileName = catId.endsWith("_collection") ? `${catId}-${day}.json` : (config ? config.fileName : `${catId}.json`);
                let existingData = [];
                if (env.R2_BUCKET) {
                    const oldObj = await env.R2_BUCKET.get(fileName);
                    if (oldObj) {
                        try {
                            const oldJson = await oldObj.json();
                            if (oldJson && oldJson.data) existingData = oldJson.data;
                        } catch(e) {}
                    }
                }

                const mergedList = [...processed, ...existingData];
                const finalData = deduplicateByTmdbId(mergedList);

                if (env.R2_BUCKET) {
                    let pForm = config ? config.platform : "tmdb";
                    let pType = config ? config.type : "tv_series";
                    if(catId === "weekly_anime_collection") { pForm = "bangumi"; pType = "animation"; }
                    else if(catId === "weekly_guoman_collection") { pType = "animation"; }

                    const dayJson = { platform: pForm, type: pType, count: finalData.length, lastUpdated: new Date().toISOString(), data: finalData };
                    await env.R2_BUCKET.put(fileName, JSON.stringify(dayJson, null, 2), { httpMetadata: { contentType: "application/json" } });
                }
                
                injectedCount += processed.length;
            }

            return new Response(JSON.stringify({ success: true, count: injectedCount }), { headers: { "Content-Type": "application/json", ...antiCacheHeaders } });
        } catch (e) {
            return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500, headers: antiCacheHeaders });
        }
    }

    if (action === "api" && request.method === "GET") {
      if (!env.R2_BUCKET) return new Response(JSON.stringify({ error: "R2未绑定" }), { status: 500, headers: antiCacheHeaders });
      if (!category || category === 'login') return new Response("Not Found", { status: 404, headers: antiCacheHeaders });

      let config = CATEGORY_MAP[category];
      
      if (!config && category.includes("_collection-")) {
          config = { fileName: `${category}.json` };
      }

      if (!config) return new Response("Not Found", { status: 404, headers: antiCacheHeaders });

      const object = await env.R2_BUCKET.get(config.fileName);
      if (object === null) return new Response(JSON.stringify({ count: 0, data: [] }), { headers: { "Content-Type": "application/json;charset=UTF-8", ...antiCacheHeaders } });

      const sortType = url.searchParams.get("sort");
      if (sortType === "year" || sortType === "heat") {
        const rawData = await object.json();
        if (rawData.data && Array.isArray(rawData.data)) {
          const extractYearAndDate = (x) => {
              if (!x || typeof x !== 'object') return { year: 0, fullDate: "0000-00-00", isUpcoming: false };
              const rawDateStr = String(
                  x.release_date || x.first_air_date || x.air_date || x.last_episode_air_date || 
                  (Array.isArray(x.pubdates) ? x.pubdates[0] : x.pubdate) || x.year || ""
              ).trim();

              const dateMatch = rawDateStr.match(/\b(19|20)\d{2}[-/.]\d{1,2}[-/.]\d{1,2}\b/);
              if (dateMatch) {
                  const parts = dateMatch[0].split(/[-/.]/);
                  const y = parseInt(parts[0], 10);
                  const m = parts[1].padStart(2, '0');
                  const d = parts[2].padStart(2, '0');
                  return { year: y, fullDate: `${y}-${m}-${d}`, isUpcoming: false };
              }

              const yearMatch = rawDateStr.match(/\b(19|20)\d{2}\b/);
              if (yearMatch) {
                  const y = parseInt(yearMatch[0], 10);
                  return { year: y, fullDate: `${y}-01-01`, isUpcoming: false };
              }

              const currentYear = new Date().getFullYear();
              return { year: currentYear + 1, fullDate: `${currentYear + 1}-12-31`, isUpcoming: true };
          };

          if (sortType === "year") {
            rawData.data.sort((a, b) => {
              const infoA = extractYearAndDate(a);
              const infoB = extractYearAndDate(b);
              if (infoB.year !== infoA.year) return infoB.year - infoA.year;
              if (infoB.fullDate !== infoA.fullDate) return infoB.fullDate.localeCompare(infoA.fullDate);
              return (b.vote_average || 0) - (a.vote_average || 0);
            });
          } else if (sortType === "heat") {
            rawData.data.sort((a, b) => {
              const voteDiff = (b.vote_average || 0) - (a.vote_average || 0);
              if (Math.abs(voteDiff) > 0.01) return voteDiff;
              return (b.popularity || 0) - (a.popularity || 0);
            });
          }
        }
        return new Response(JSON.stringify(rawData), { headers: { "Content-Type": "application/json;charset=UTF-8", ...antiCacheHeaders } });
      }

      return new Response(object.body, { headers: { "Content-Type": "application/json;charset=UTF-8", ...antiCacheHeaders } });
    }

    if (action === "api" && category === "layout_config" && request.method === "GET") {
      if (!env.R2_BUCKET) return new Response("{}", { headers: antiCacheHeaders });
      const obj = await env.R2_BUCKET.get("layout-config.json");
      if (obj === null) return new Response("{}", { headers: { "Content-Type": "application/json", ...antiCacheHeaders } });
      return new Response(obj.body, { headers: { "Content-Type": "application/json", ...antiCacheHeaders } });
    }

    if (action === "action" && category === "layout_config" && request.method === "POST") {
      if (!isAdmin(request, env)) return new Response(JSON.stringify({ success: false, error: "越权！" }), { status: 403, headers: antiCacheHeaders });
      try {
        const body = await request.text();
        if (env.R2_BUCKET) {
          await env.R2_BUCKET.put("layout-config.json", body, { httpMetadata: { contentType: "application/json" } });
        }
        return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json", ...antiCacheHeaders } });
      } catch (e) {
        return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500, headers: antiCacheHeaders });
      }
    }

    if (action === "action" && category === "delete_item" && request.method === "POST") {
      if (!isAdmin(request, env)) return new Response(JSON.stringify({ success: false, error: "越权！" }), { status: 403, headers: antiCacheHeaders });
      try {
        const body = await request.json();
        const { tmdbId, category: catId, mode = 'remove' } = body;
        
        let fileName = catId + ".json";
        if (catId.endsWith("_collection")) {
            fileName = `${catId}-${body.weekday || 1}.json`;
        } else {
            const config = CATEGORY_MAP[catId];
            if (config) fileName = config.fileName;
        }

        if (env.R2_BUCKET) {
            const oldObj = await env.R2_BUCKET.get(fileName);
            if (oldObj) {
                const oldJson = await oldObj.json();
                if (oldJson && oldJson.data) {
                    const targetItem = oldJson.data.find(item => item.tmdbId == tmdbId);
                    
                    if (targetItem && mode === 'blacklist') {
                        await addToBlacklist(env, [targetItem], catId); 
                    }
                    
                    oldJson.data = oldJson.data.filter(item => item.tmdbId != tmdbId);
                    oldJson.count = oldJson.data.length;
                    await env.R2_BUCKET.put(fileName, JSON.stringify(oldJson, null, 2), { httpMetadata: { contentType: "application/json" } });
                    return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json", ...antiCacheHeaders } });
                }
            }
        }
        return new Response(JSON.stringify({ success: false, error: "未找到文件" }), { status: 404, headers: antiCacheHeaders });
      } catch (e) {
        return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500, headers: antiCacheHeaders });
      }
    }

    if (action === "action" && category === "batch_delete" && request.method === "POST") {
      if (!isAdmin(request, env)) return new Response(JSON.stringify({ success: false, error: "越权！" }), { status: 403, headers: antiCacheHeaders });
      try {
        const body = await request.json();
        const { tmdbIds, category: catId, weekday, mode = 'remove' } = body;
        if (!tmdbIds || !Array.isArray(tmdbIds)) return new Response(JSON.stringify({ success: false, error: "参数错误" }), { status: 400, headers: antiCacheHeaders });

        let fileName = catId + ".json";
        if (catId.endsWith("_collection")) {
            fileName = `${catId}-${weekday || 1}.json`;
        } else {
            const config = CATEGORY_MAP[catId];
            if (config) fileName = config.fileName;
        }

        if (env.R2_BUCKET) {
            const oldObj = await env.R2_BUCKET.get(fileName);
            if (oldObj) {
                const oldJson = await oldObj.json();
                if (oldJson && oldJson.data) {
                    const idsSet = new Set(tmdbIds.map(String));
                    const itemsToDelete = oldJson.data.filter(item => idsSet.has(String(item.tmdbId)));
                    
                    if (itemsToDelete.length > 0 && mode === 'blacklist') {
                        await addToBlacklist(env, itemsToDelete, catId);
                    }
                    
                    oldJson.data = oldJson.data.filter(item => !idsSet.has(String(item.tmdbId)));
                    oldJson.count = oldJson.data.length;
                    await env.R2_BUCKET.put(fileName, JSON.stringify(oldJson, null, 2), { httpMetadata: { contentType: "application/json" } });
                    return new Response(JSON.stringify({ success: true, count: oldJson.count }), { headers: { "Content-Type": "application/json", ...antiCacheHeaders } });
                }
            }
        }
        return new Response(JSON.stringify({ success: false, error: "未找到文件" }), { status: 404, headers: antiCacheHeaders });
      } catch (e) {
        return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500, headers: antiCacheHeaders });
      }
    }

    if (action === "action" && category === "sync" && request.method === "POST") {
      const targetCat = pathParts[2];
      if (!isAdmin(request, env)) return new Response(JSON.stringify({ success: false, error: "越权！" }), { status: 403, headers: antiCacheHeaders });

      const limitStr = url.searchParams.get("limit");
      const limit = limitStr ? parseInt(limitStr, 10) : 100;
      const fetchLogo = url.searchParams.get("fetch_logo") !== "0";
      const fetchThumb = url.searchParams.get("fetch_thumb") !== "0";
      const quiet = url.searchParams.get("quiet") === "1";
      const clearCooldown = url.searchParams.get("clear_cooldown") === "1";

      try {
        const currentOrigin = new URL(request.url).origin;
        const webCtx = { subreqs: 0, maxSubreqs: 48, isSafeMode: false, clearCooldown: clearCooldown };
        
        const result = await executeSyncTask(targetCat, env, limit, quiet, webCtx, currentOrigin, fetchLogo, fetchThumb);

        return new Response(JSON.stringify({ success: true, count: result.count, stats: result.stats, newLogos: result.newLogos }), { headers: { "Content-Type": "application/json", ...antiCacheHeaders } });
      } catch (e) { return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500, headers: antiCacheHeaders }); }
    }

    if (action === "action" && category === "list_posters" && request.method === "POST") {
        if (!isAdmin(request, env)) return new Response(JSON.stringify({ success: false, error: "越权！" }), { status: 403, headers: antiCacheHeaders });
        try {
            const body = await request.json();
            const tmdbId = body.tmdbId;
            const mediaType = body.type || 'movie';
            const fctx = { subreqs: 0, maxSubreqs: 5, isSafeMode: false, clearCooldown: true };
            
            const details = await tmdbFetch(
                mediaType === "movie" ? `/movie/${tmdbId}` : `/tv/${tmdbId}`,
                { language: "zh-CN" }, env, fctx
            );
            const origLang = details.original_language || "";

            const imagesData = await tmdbFetch(
                mediaType === "movie" ? `/movie/${tmdbId}/images` : `/tv/${tmdbId}/images`,
                {}, env, fctx
            );
            
            let posters = imagesData.posters || [];
            
            const getPosterScore = (p) => {
                const lang = p.iso_639_1;
                const isClean = lang === null || lang === 'xx' || lang === 'none' || !lang;
                let score = isClean ? 100000 : 0; 
                if (lang === 'zh' || lang === 'zh-cn' || lang === 'zh-tw' || lang === 'zh-hk') score += 500;
                else if (origLang && lang === origLang) score += 300;
                else if (lang === 'en') score += 100;
                return score + (p.vote_average || 0);
            };

            posters.sort((a, b) => getPosterScore(b) - getPosterScore(a));
            
            const TMDB_IMG_POSTER = 'https://image.tmdb.org/t/p/original';
            const posterUrls = posters.map(p => ({
                url: TMDB_IMG_POSTER + p.file_path,
                file_path: p.file_path,
                lang: p.iso_639_1,
                isClean: p.iso_639_1 === null || p.iso_639_1 === 'xx' || p.iso_639_1 === 'none' || !p.iso_639_1
            }));
            
            return new Response(JSON.stringify({ success: true, posters: posterUrls }), {
                headers: { "Content-Type": "application/json", ...antiCacheHeaders }
            });
        } catch (e) {
            return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500, headers: antiCacheHeaders });
        }
    }

    if (action === "action" && category === "list_logos" && request.method === "POST") {
        if (!isAdmin(request, env)) return new Response(JSON.stringify({ success: false, error: "越权！" }), { status: 403, headers: antiCacheHeaders });
        try {
            const body = await request.json();
            const tmdbId = body.tmdbId;
            const mediaType = body.type || 'movie';
            const fctx = { subreqs: 0, maxSubreqs: 5, isSafeMode: false, clearCooldown: true };
            
            const details = await tmdbFetch(
                mediaType === "movie" ? `/movie/${tmdbId}` : `/tv/${tmdbId}`,
                { language: "zh-CN" }, env, fctx
            );
            const origLang = details.original_language || "";

            const imagesData = await tmdbFetch(
                mediaType === "movie" ? `/movie/${tmdbId}/images` : `/tv/${tmdbId}/images`,
                {}, env, fctx
            );
            
            let logos = imagesData.logos || [];
            
            const origL = (origLang || "").toLowerCase();
            const getLangScore = (lang) => {
                const l = String(lang || "").toLowerCase();
                if (origL && (l === origL || (origL === 'zh' && l.startsWith('zh')))) return 10000;
                if (l === 'en') return 5000;
                if (l === 'zh' || l.startsWith('zh')) return 3000;
                if (!l || l === 'null' || l === 'xx') return 2000;
                return 1000;
            };

            logos.sort((a, b) => {
                const scoreA = getLangScore(a.iso_639_1) * 100 + (a.vote_average || 0);
                const scoreB = getLangScore(b.iso_639_1) * 100 + (b.vote_average || 0);
                return scoreB - scoreA;
            });
            
            const TMDB_IMG_LOGO = 'https://image.tmdb.org/t/p/original';
            const logoUrls = logos.map(l => ({ url: TMDB_IMG_LOGO + l.file_path, file_path: l.file_path, lang: l.iso_639_1 }));
            
            return new Response(JSON.stringify({ success: true, logos: logoUrls }), {
                headers: { "Content-Type": "application/json", ...antiCacheHeaders }
            });
        } catch (e) {
            return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500, headers: antiCacheHeaders });
        }
    }

    if (action === "action" && category === "list_thumbs" && request.method === "POST") {
        if (!isAdmin(request, env)) return new Response(JSON.stringify({ success: false, error: "越权！" }), { status: 403, headers: antiCacheHeaders });
        try {
            const body = await request.json();
            const tmdbId = body.tmdbId;
            const mediaType = body.type || 'movie';
            const fctx = { subreqs: 0, maxSubreqs: 5, isSafeMode: false, clearCooldown: true };
            
            const details = await tmdbFetch(
                mediaType === "movie" ? `/movie/${tmdbId}` : `/tv/${tmdbId}`,
                { language: "zh-CN" }, env, fctx
            );
            const origLang = details.original_language || "";

            const imagesData = await tmdbFetch(
                mediaType === "movie" ? `/movie/${tmdbId}/images` : `/tv/${tmdbId}/images`,
                {}, env, fctx
            );
            
            let backdrops = imagesData.backdrops || [];
            
            const getLangScore = (lang) => {
                if (!lang) return 0;
                const l = String(lang).toLowerCase();
                if (l === 'zh' || l === 'zh-cn' || l === 'zh-tw' || l === 'zh-hk') return 100;
                if (origLang && l === String(origLang).toLowerCase()) return 90;
                if (l === 'ja') return 85;
                if (l === 'ko') return 80;
                if (l === 'th') return 75;
                if (l === 'en') return 70;
                if (['es', 'fr', 'de', 'ru', 'pt', 'it', 'vi', 'id', 'tl'].includes(l)) return 60;
                if (l !== 'null' && l !== 'xx' && l !== 'none') return 40;
                return 0;
            };

            backdrops.sort((a, b) => {
                const scoreA = getLangScore(a.iso_639_1) * 1000 + (a.vote_average || 0);
                const scoreB = getLangScore(b.iso_639_1) * 1000 + (b.vote_average || 0);
                return scoreB - scoreA;
            });
            
            const TMDB_IMG_BACKDROP = 'https://image.tmdb.org/t/p/original';
            const thumbUrls = backdrops.map(l => ({ 
                url: TMDB_IMG_BACKDROP + l.file_path, 
                file_path: l.file_path, 
                lang: l.iso_639_1,
                isClean: l.iso_639_1 === null || l.iso_639_1 === 'xx' || l.iso_639_1 === 'none' || !l.iso_639_1
            }));
            
            return new Response(JSON.stringify({ success: true, thumbs: thumbUrls }), {
                headers: { "Content-Type": "application/json", ...antiCacheHeaders }
            });
        } catch (e) {
            return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500, headers: antiCacheHeaders });
        }
    }

    if (action === "action" && category === "update_single_poster" && request.method === "POST") {
        if (!isAdmin(request, env)) return new Response(JSON.stringify({ success: false, error: "越权！" }), { status: 403, headers: antiCacheHeaders });
        try {
            const body = await request.json();
            const tmdbId = body.tmdbId;
            let posterUrl = body.poster; 
            const categoryName = body.category;

            if (categoryName && env.R2_BUCKET && posterUrl) {
                if (posterUrl.includes('image.tmdb.org')) {
                    posterUrl = posterUrl.replace(/\/w\d+/, '/original');
                }

                let fileName = categoryName + ".json";
                if (categoryName.endsWith("_collection")) {
                    fileName = `${categoryName}-${body.weekday || 1}.json`;
                } else {
                    const config = CATEGORY_MAP[categoryName];
                    if (config) fileName = config.fileName;
                }

                const oldObj = await env.R2_BUCKET.get(fileName);
                if (oldObj) {
                    const oldJson = await oldObj.json();
                    if (oldJson && oldJson.data) {
                        let updated = false;
                        oldJson.data.forEach(item => {
                            if (item.tmdbId == tmdbId) {
                                item.poster_path = posterUrl;
                                item.poster_source = 'manual'; 
                                item.crawledAt = new Date().toISOString();
                                item.image_scanned = true;
                                updated = true;
                            }
                        });
                        if (updated) {
                            await env.R2_BUCKET.put(fileName, JSON.stringify(oldJson, null, 2), { httpMetadata: { contentType: "application/json" } });
                        }
                    }
                }
            }
            return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json", ...antiCacheHeaders } });
        } catch (e) {
            return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500, headers: antiCacheHeaders });
        }
    }

    if (action === "action" && category === "update_single_no_logo_poster" && request.method === "POST") {
        if (!isAdmin(request, env)) return new Response(JSON.stringify({ success: false, error: "越权！" }), { status: 403, headers: antiCacheHeaders });
        try {
            const body = await request.json();
            const tmdbId = body.tmdbId;
            let noLogoPosterUrl = body.noLogoPoster; 
            const categoryName = body.category;

            if (categoryName && env.R2_BUCKET && noLogoPosterUrl) {
                if (noLogoPosterUrl.includes('image.tmdb.org')) {
                    noLogoPosterUrl = noLogoPosterUrl.replace(/\/w\d+/, '/original');
                }

                let fileName = categoryName + ".json";
                if (categoryName.endsWith("_collection")) {
                    fileName = `${categoryName}-${body.weekday || 1}.json`;
                } else {
                    const config = CATEGORY_MAP[categoryName];
                    if (config) fileName = config.fileName;
                }

                const oldObj = await env.R2_BUCKET.get(fileName);
                if (oldObj) {
                    const oldJson = await oldObj.json();
                    if (oldJson && oldJson.data) {
                        let updated = false;
                        oldJson.data.forEach(item => {
                            if (item.tmdbId == tmdbId) {
                                item.noLogoPoster = noLogoPosterUrl;
                                item.no_logo_poster_source = 'manual'; 
                                item.crawledAt = new Date().toISOString();
                                item.image_scanned = true;
                                updated = true;
                            }
                        });
                        if (updated) {
                            await env.R2_BUCKET.put(fileName, JSON.stringify(oldJson, null, 2), { httpMetadata: { contentType: "application/json" } });
                        }
                    }
                }
            }
            return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json", ...antiCacheHeaders } });
        } catch (e) {
            return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500, headers: antiCacheHeaders });
        }
    }

    if (action === "action" && category === "update_single_logo" && request.method === "POST") {
        if (!isAdmin(request, env)) return new Response(JSON.stringify({ success: false, error: "越权！" }), { status: 403, headers: antiCacheHeaders });
        try {
            const body = await request.json();
            const tmdbId = body.tmdbId;
            let logoUrl = body.logo; 
            const title = body.title || "未知";
            const categoryName = body.category;
            const currentOrigin = new URL(request.url).origin;

            if (categoryName && env.R2_BUCKET) {
                if (logoUrl && logoUrl.includes('image.tmdb.org')) {
                    logoUrl = logoUrl.replace(/\/w\d+/, '/original');
                }

                let fileName = categoryName + ".json";
                if (categoryName.endsWith("_collection")) {
                    fileName = `${categoryName}-${body.weekday || 1}.json`;
                } else {
                    const config = CATEGORY_MAP[categoryName];
                    if (config) fileName = config.fileName;
                }

                const oldObj = await env.R2_BUCKET.get(fileName);
                if (oldObj) {
                    const oldJson = await oldObj.json();
                    if (oldJson && oldJson.data) {
                        let updated = false;
                        oldJson.data.forEach(item => {
                            if (item.tmdbId == tmdbId) {
                                if (logoUrl) {
                                    item.logo = logoUrl;
                                    item.verified_no_logo = false;
                                    item.logoEmptyAt = null;
                                } else {
                                    item.logo = currentOrigin + '/api/text_logo.svg?v=' + Date.now() + '&text=' + encodeURIComponent(title || item.title);
                                    item.verified_no_logo = true;
                                    item.logoEmptyAt = new Date().toISOString();
                                }
                                item.logo_source = 'manual'; 
                                item.crawledAt = new Date().toISOString();
                                item.image_scanned = true;
                                updated = true;
                            }
                        });
                        if (updated) {
                            await env.R2_BUCKET.put(fileName, JSON.stringify(oldJson, null, 2), { httpMetadata: { contentType: "application/json" } });
                        }
                    }
                }
            }
            return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json", ...antiCacheHeaders } });
        } catch (e) {
            return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500, headers: antiCacheHeaders });
        }
    }

    if (action === "action" && category === "update_single_thumb" && request.method === "POST") {
        if (!isAdmin(request, env)) return new Response(JSON.stringify({ success: false, error: "越权！" }), { status: 403, headers: antiCacheHeaders });
        try {
            const body = await request.json();
            const tmdbId = body.tmdbId;
            let thumbUrl = body.thumb; 
            const categoryName = body.category;

            if (categoryName && env.R2_BUCKET && thumbUrl) {
                if (thumbUrl.includes('image.tmdb.org')) {
                    thumbUrl = thumbUrl.replace(/\/w\d+/, '/original');
                }

                let fileName = categoryName + ".json";
                if (categoryName.endsWith("_collection")) {
                    fileName = `${categoryName}-${body.weekday || 1}.json`;
                } else {
                    const config = CATEGORY_MAP[categoryName];
                    if (config) fileName = config.fileName;
                }

                const oldObj = await env.R2_BUCKET.get(fileName);
                if (oldObj) {
                    const oldJson = await oldObj.json();
                    if (oldJson && oldJson.data) {
                        let updated = false;
                        oldJson.data.forEach(item => {
                            if (item.tmdbId == tmdbId) {
                                item.thumb = thumbUrl;
                                item.thumb_source = 'manual'; 
                                item.backdrop_path = thumbUrl;
                                item.crawledAt = new Date().toISOString();
                                item.image_scanned = true;
                                updated = true;
                            }
                        });
                        if (updated) {
                            await env.R2_BUCKET.put(fileName, JSON.stringify(oldJson, null, 2), { httpMetadata: { contentType: "application/json" } });
                        }
                    }
                }
            }
            return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json", ...antiCacheHeaders } });
        } catch (e) {
            return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500, headers: antiCacheHeaders });
        }
    }

    if (action === "action" && category === "batch_force_logo" && request.method === "POST") {
      if (!isAdmin(request, env)) return new Response(JSON.stringify({ success: false, error: "越权！" }), { status: 403, headers: antiCacheHeaders });
      try {
        const body = await request.json();
        
        const itemsToProcess = body.items || [];
        const categoryName = body.category || ""; 
        if (!itemsToProcess.length) return new Response(JSON.stringify({ success: false, error: "缺少数据项" }), { status: 400, headers: antiCacheHeaders });

        const results = [];
        const currentOrigin = new URL(request.url).origin;
        
        const fctx = { subreqs: 0, maxSubreqs: 45, isSafeMode: false, clearCooldown: true };

        if (categoryName && env.R2_BUCKET) {
            let fileName = categoryName + ".json";
            if (categoryName.endsWith("_collection")) {
                fileName = `${categoryName}-${body.weekday || 1}.json`;
            } else {
                const config = CATEGORY_MAP[categoryName];
                if (config) fileName = config.fileName;
            }

            let oldObj = await env.R2_BUCKET.get(fileName);
            if (oldObj) {
                let oldJson = await oldObj.json();
                if (oldJson && oldJson.data) {
                    let changed = false;
                    
                    for (const reqItem of itemsToProcess) {
                        const tmdbId = reqItem.id;
                        const mediaType = reqItem.type || 'movie';

                        if (fctx.subreqs >= fctx.maxSubreqs - 1) {
                            break; 
                        }
                        
                        try {
                            const details = await tmdbFetch(
                                mediaType === "movie" ? `/movie/${tmdbId}` : `/tv/${tmdbId}`,
                                { language: "zh-CN" },
                                env, fctx
                            );
                            
                            const imagesData = await tmdbFetch(
                                mediaType === "movie" ? `/movie/${tmdbId}/images` : `/tv/${tmdbId}/images`,
                                {}, 
                                env, fctx
                            );

                            const ext = extractImages(imagesData, details.backdrop_path, details.poster_path, details.original_language || "");
                            const title = details.title || details.name || "";
                            
                            let logoUrl = null;
                            if (ext.logo) {
                                logoUrl = ext.logo.startsWith('http') ? ext.logo : 'https://image.tmdb.org/t/p/original' + ext.logo;
                            }
                            
                            let thumbUrl = null;
                            if (ext.thumb) {
                                thumbUrl = ext.thumb.startsWith('http') ? ext.thumb : 'https://image.tmdb.org/t/p/original' + ext.thumb;
                            }

                            let cleanBackdropUrl = null;
                            if (ext.cleanBackdrop) {
                                cleanBackdropUrl = ext.cleanBackdrop.startsWith('http') ? ext.cleanBackdrop : 'https://image.tmdb.org/t/p/original' + ext.cleanBackdrop;
                            }

                            let officialPosterUrl = null;
                            if (ext.officialPoster) {
                                officialPosterUrl = ext.officialPoster.startsWith('http') ? ext.officialPoster : 'https://image.tmdb.org/t/p/original' + ext.officialPoster;
                            }

                            let noLogoPosterUrl = null;
                            if (ext.noLogoPoster) {
                                noLogoPosterUrl = ext.noLogoPoster.startsWith('http') ? ext.noLogoPoster : 'https://image.tmdb.org/t/p/original' + ext.noLogoPoster;
                            }

                            oldJson.data.forEach(item => {
                                if (item.tmdbId == tmdbId) { 
                                    if (logoUrl && item.logo_source !== 'manual') {
                                        item.logo = logoUrl;
                                        item.logo_source = 'auto'; 
                                        item.verified_no_logo = false;
                                        item.logoEmptyAt = null;
                                    } else if (!item.logo || item.logo.includes('text_logo.svg')) {
                                        item.logo = currentOrigin + '/api/text_logo.svg?v=' + Date.now() + '&text=' + encodeURIComponent(title || item.title);
                                        item.logo_source = 'auto'; 
                                        item.verified_no_logo = true;
                                        item.logoEmptyAt = new Date().toISOString();
                                    }

                                    if (thumbUrl && item.thumb_source !== 'manual') {
                                        item.thumb = thumbUrl;
                                        item.thumb_source = 'auto'; 
                                    }

                                    if (cleanBackdropUrl && item.backdrop_source !== 'manual') {
                                        item.backdrop_path = cleanBackdropUrl;
                                        item.backdrop_source = 'auto'; 
                                    }

                                    if (officialPosterUrl && item.poster_source !== 'manual') {
                                        item.poster_path = officialPosterUrl;
                                        item.poster_source = 'auto'; 
                                    }

                                    if (noLogoPosterUrl && item.no_logo_poster_source !== 'manual') {
                                        item.noLogoPoster = noLogoPosterUrl;
                                        item.no_logo_poster_source = 'auto'; 
                                    }

                                    item.crawledAt = new Date().toISOString();
                                    item.image_scanned = true; 
                                    changed = true;
                                }
                            });
                            results.push({ tmdbId, title, logo: logoUrl, success: true });
                        } catch(e) {
                            results.push({ tmdbId, success: false, error: e.message });
                        }
                    }
                    
                    if (changed) {
                        await env.R2_BUCKET.put(fileName, JSON.stringify(oldJson, null, 2), { httpMetadata: { contentType: "application/json" } });
                    }
                }
            }
        }
        
        return new Response(JSON.stringify({ success: true, results }), {
          headers: { "Content-Type": "application/json", ...antiCacheHeaders }
        });
      } catch (e) {
        return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500, headers: antiCacheHeaders });
      }
    }

    if (action === "action" && category === "tg_webhook" && request.method === "POST") {
      if (!isAdmin(request, env)) return new Response(JSON.stringify({ success: false, error: "越权！" }), { status: 403, headers: antiCacheHeaders });
      if (!env.TG_BOT_TOKEN) return new Response(JSON.stringify({ success: false, error: "未配置 TG_BOT_TOKEN 环境变量" }), { status: 400, headers: antiCacheHeaders });

      try {
        const currentUrl = new URL(request.url);
        const webhookUrl = `${currentUrl.origin}/api/tg_webhook`;
        const setWebhookUrl = `https://api.telegram.org/bot${env.TG_BOT_TOKEN}/setWebhook?url=${encodeURIComponent(webhookUrl)}&allowed_updates=${encodeURIComponent('["message","callback_query"]')}`;
        const res = await fetch(setWebhookUrl);
        const data = await res.json();
        return new Response(JSON.stringify({ success: data.ok, desc: data.description }), { headers: antiCacheHeaders });
      } catch (e) { return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500, headers: antiCacheHeaders }); }
    }

    if (action === "action" && category === "tg_notify" && request.method === "POST") {
      if (!isAdmin(request, env)) return new Response(JSON.stringify({ success: false, error: "越权！" }), { status: 403, headers: antiCacheHeaders });
      try {
        const body = await request.json();
        if (body.message) { await sendTgMessage(env, body.message); }
        return new Response(JSON.stringify({ success: true }), { headers: antiCacheHeaders });
      } catch (e) { return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500, headers: antiCacheHeaders }); }
    }

    if (action === "action" && category === "github" && request.method === "POST") {
      if (!isAdmin(request, env)) return new Response(JSON.stringify({ success: false, error: "越权！" }), { status: 403, headers: antiCacheHeaders });
      if (!env.GITHUB_TOKEN || !env.GITHUB_REPO || !env.GITHUB_PATH) return new Response(JSON.stringify({ success: false, error: "缺少 GitHub 环境变量" }), { status: 400, headers: antiCacheHeaders });

      try {
        const body = await request.json(); 
        const codeString = body.tsCode;
        const selectedCats = body.selectedCats || [];
        const currentOrigin = new URL(request.url).origin;

        const apiUrl = `https://api.github.com/repos/${env.GITHUB_REPO}/contents/${env.GITHUB_PATH}`;
        const headers = { "Authorization": `token ${env.GITHUB_TOKEN}`, "User-Agent": "EPlayerX-DataHub", "Accept": "application/vnd.github.v3+json" };

        let fileSha = "";
        let existingText = "";
        const getRes = await fetch(apiUrl, { headers });
        if (getRes.ok) { 
          const fileData = await getRes.json(); 
          fileSha = fileData.sha;
          if (fileData.content) {
            const binaryStr = atob(fileData.content.replace(/\s/g, ''));
            const bytes = new Uint8Array(binaryStr.length);
            for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
            existingText = new TextDecoder('utf-8').decode(bytes);
          }
        }

        let finalTsCode = codeString;
        if (existingText && selectedCats.length > 0) {
          finalTsCode = incrementalMergeConfigTs(existingText, selectedCats, currentOrigin, codeString);
        }

        const encoder = new TextEncoder();
        const utf8Bytes = encoder.encode(finalTsCode);
        let binary = '';
        for (let i = 0; i < utf8Bytes.length; i++) binary += String.fromCharCode(utf8Bytes[i]);
        const base64Content = btoa(binary);

        const putRes = await fetch(apiUrl, { 
          method: "PUT", 
          headers, 
          body: JSON.stringify({ 
            message: "Update config.ts via Web Dashboard CMS (Auto Version & Clean Merge)", 
            content: base64Content, 
            sha: fileSha || undefined 
          }) 
        });

        if (putRes.ok) return new Response(JSON.stringify({ success: true }), { headers: antiCacheHeaders });
        else { const err = await putRes.json(); return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: antiCacheHeaders }); }
      } catch (e) { return new Response(JSON.stringify({ success: false, error: "执行过程发生异常: " + e.message }), { status: 500, headers: antiCacheHeaders }); }
    }

    return new Response("Not Found", { status: 404, headers: antiCacheHeaders });
  },

  // ==========================================
  // 10. 智能极速调度引擎 (修复死循环与通知轰炸版)
  // ==========================================
  async runCronLogic(env, ctx, triggerSource = "【CF Cron 定时器】", isManualStart = false) {
    if (!env.R2_BUCKET) throw new Error("未检测到 env.R2_BUCKET 存储桶绑定");

    const taskQueue = [];
    for (const cat of CATEGORY_CONFIGS) {
      if (cat.id.endsWith("_collection")) {
        for (let d = 1; d <= 7; d++) {
          taskQueue.push({
            id: `${cat.id}-${d}`,
            name: `${cat.name} (周${["一","二","三","四","五","六","日"][d-1]})`
          });
        }
      } else {
        taskQueue.push({
          id: cat.id,
          name: cat.name
        });
      }
    }
    const totalTasks = taskQueue.length;

    let state = { 
      status: "IDLE",
      currentIndex: 0, 
      cycleCount: 1, 
      cycleStartTime: null, 
      lastRunDate: null, 
      isPaused: false,
      autoStartHour: 3,
      totalAssets: { count: 0, logos: 0, noLogoPosters: 0, cleanBackdrops: 0, posters: 0, thumbs: 0 }
    };

    try {
      const stateObj = await env.R2_BUCKET.get("cron_state.json");
      if (stateObj) state = Object.assign(state, await stateObj.json());
    } catch (e) {}

    if (state.isPaused && !isManualStart) {
      return { triggerSource, status: "PAUSED", msg: "后台自动更新已暂停" };
    }

    const nowTimestamp = Date.now();
    const bjTime = new Date(nowTimestamp + 8 * 3600 * 1000);
    const bjHour = bjTime.getUTCHours();
    const bjDateStr = bjTime.toISOString().substring(0, 10);
    const nowTimeStr = bjTime.toISOString().replace('T', ' ').substring(0, 19);
    const targetUrl = env.WORKER_URL || "https://homepage.eplayerx.cc.cd";

    const isAutoTime = (state.autoStartHour === bjHour && state.lastRunDate !== bjDateStr);
    const shouldInitNewCycle = (state.status !== "RUNNING") && (isManualStart || isAutoTime);

    if (shouldInitNewCycle) {
      state.status = "RUNNING";
      state.currentIndex = 0;
      state.cycleStartTime = nowTimeStr;
      state.lastRunDate = bjDateStr;
      state.isPaused = false;
      state.totalAssets = { count: 0, logos: 0, noLogoPosters: 0, cleanBackdrops: 0, posters: 0, thumbs: 0 };

      if (env.TG_BOT_TOKEN && env.TG_CHAT_ID) {
        const startMsg = `🚀 <b>[大盘全量同步 · 开始执行]</b>\n` +
                         `═══════════════════\n` +
                         `🎯 <b>触发来源</b>: ${isManualStart ? '👑 手动立即测试' : `⏰ 定时自动启动 (${state.autoStartHour}:00)`}\n` +
                         `📊 <b>计划轮次</b>: 第 ${state.cycleCount || 1} 轮全量更新\n` +
                         `📋 <b>总任务量</b>: 共 ${totalTasks} 个分类与子周历\n` +
                         `⏰ <b>启动时间</b>: <code>${nowTimeStr}</code>\n` +
                         `⚡ <i>全速推进中，抓取完毕后将自动推送五维资产明细...</i>`;
        await sendTgMessage(env, startMsg);
      }
    }

    if (state.status !== "RUNNING") {
      return { triggerSource, status: "IDLE", msg: `待命 (每日 ${state.autoStartHour}:00 启动)` };
    }

    const reqCtx = { subreqs: 0, maxSubreqs: 46, isSafeMode: false, clearCooldown: false };
    const batchStartTime = Date.now();
    let tasksExecutedThisBatch = 0;

    while (state.currentIndex < totalTasks) {
      if (reqCtx.subreqs >= 25 || (Date.now() - batchStartTime) >= 14000) {
        break;
      }

      const currentTask = taskQueue[state.currentIndex];
      try {
        const res = await executeSyncTask(currentTask.id, env, 40, true, reqCtx, targetUrl, true, true);
        if (res && res.stats) {
          state.totalAssets.count += (res.count || 0);
          state.totalAssets.logos += (res.stats.logos || 0);
          state.totalAssets.noLogoPosters += (res.stats.noLogoPosters || 0);
          state.totalAssets.cleanBackdrops += (res.stats.cleanBackdrops || 0);
          state.totalAssets.posters += (res.stats.posters || 0);
          state.totalAssets.thumbs += (res.stats.thumbs || 0);
        }
        state.lastTask = currentTask.name;
        state.lastStatus = `成功 (${res?.count || 0}部)`;
      } catch (err) {
        state.lastTask = currentTask.name;
        state.lastStatus = `异常: ${err.message}`;
      }

      state.currentIndex++;
      tasksExecutedThisBatch++;

      if (reqCtx.subreqs >= 20) {
        break;
      }
    }

    state.lastRunTime = nowTimeStr;

    if (state.currentIndex >= totalTasks) {
      state.status = "IDLE";
      state.currentIndex = 0;
      state.cycleCount = (state.cycleCount || 1) + 1;

      if (env.TG_BOT_TOKEN && env.TG_CHAT_ID) {
        const finishMsg = `🎉 <b>[大盘全量同步 · 全部圆满完成！]</b>\n` +
                          `═══════════════════\n` +
                          `📊 <b>完成轮次</b>: 第 ${(state.cycleCount - 1) || 1} 轮\n` +
                          `📋 <b>任务统计</b>: 全部 ${totalTasks} 个榜单/周历已全部刷新入库\n` +
                          `📦 <b>入库总量</b>: <b>${state.totalAssets.count}</b> 部影视\n\n` +
                          `✨ <b>五维资产入库汇总:</b>\n` +
                          `▪️ 💎 真实Logo: <b>${state.totalAssets.logos}</b>\n` +
                          `▪️ 🎴 纯净无字竖图: <b>${state.totalAssets.noLogoPosters}</b>\n` +
                          `▪️ 🎬 无字横屏背景: <b>${state.totalAssets.cleanBackdrops}</b>\n` +
                          `▪️ 📇 正标艺术字海报: <b>${state.totalAssets.posters}</b>\n` +
                          `▪️ 📺 横版带字剧照: <b>${state.totalAssets.thumbs}</b>\n\n` +
                          `⏱ <b>启动时间</b>: <code>${state.cycleStartTime || '未知'}</code>\n` +
                          `⏰ <b>完成时间</b>: <code>${nowTimeStr}</code>\n` +
                          `💤 <b>状态</b>: 本轮已收尾，进入休眠。`;

        const inline_keyboard = [[{ text: "🚀 点击直达 Web 控制台", url: targetUrl }]];
        await sendTgMessage(env, finishMsg, null, { inline_keyboard });
      }
    }

    await env.R2_BUCKET.put("cron_state.json", JSON.stringify(state, null, 2), {
      httpMetadata: { contentType: "application/json" }
    });

    return {
      triggerSource,
      status: state.status,
      batchRunCount: tasksExecutedThisBatch,
      progress: `${state.currentIndex}/${totalTasks}`,
      currentTime: nowTimeStr
    };
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(this.runCronLogic(env, ctx, "【Cloudflare 定时触发】", false));
  }
};
