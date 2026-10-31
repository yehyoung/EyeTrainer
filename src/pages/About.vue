<script setup>
import { settings } from '../store'

function resetRisk() {
  settings.risk = null // 觸發安全問卷重新出現
}
</script>

<template>
  <div class="page">
    <h1>📖 原理與說明</h1>

    <h2>這些訓練在練什麼？</h2>
    <p>
      眼睛的對焦由<strong>睫狀肌</strong>控制：看近時收縮讓水晶體變厚、看遠時放鬆讓水晶體變薄，
      就像相機的自動對焦。長時間盯螢幕會讓睫狀肌持續緊繃（調節痙攣），造成假性近視與視疲勞。
      眼球的轉動則由 6 條<strong>外眼肌</strong>負責，長期只盯近距離小範圍，眼球運動也會僵化。
    </p>
    <ul style="margin: 8px 0 8px 24px; color: var(--text-dim)">
      <li><strong>藏輪圖／軌跡追蹤</strong>：眼睛沿圖形輪廓移動，活動 6 條外眼肌，同時刺激睫狀肌微調對焦。</li>
      <li><strong>遠近變焦</strong>：交替看近與看遠，讓睫狀肌收縮—放鬆循環，緩解調節痙攣。</li>
      <li><strong>3D 立體圖</strong>：平行法讓對焦點落在螢幕後方，是螢幕上少數能真正「看遠」的方式。</li>
      <li><strong>放鬆休息</strong>：20-20-20、眨眼與熱敷，是眼科醫師最一致推薦的保健方式。</li>
      <li><strong>暗適應</strong>：練的不是視紫質的化學速度（那無法加快），而是用對餘光、不自己破壞暗適應，並留下可追蹤的基準線。</li>
    </ul>

    <h2>誠實的期待管理</h2>
    <p style="color: var(--text-dim)">
      眼球訓練<strong>無法治療真性近視</strong>——已拉長的眼軸不會因訓練縮短。
      它的價值在於：放鬆緊繃的睫狀肌（改善假性近視與視疲勞）、緩解電腦視覺症候群、
      維持眼球運動的靈活度。若視力持續惡化，請以眼科診療為準。
    </p>

    <h2>暗適應在練什麼？</h2>
    <p style="color: var(--text-dim)">
      視網膜有兩套感光細胞：<strong>視錐細胞</strong>負責明亮與顏色，約 5–10 分鐘就完成適應；
      <strong>視桿細胞</strong>負責微光，必須等<strong>視紫質（rhodopsin）</strong>重新合成，
      敏感度要爬升 20–30 分鐘才飽和，兩段曲線交接處就是教科書上的「rod–cone break」。
      這個化學速度<strong>無法靠練習加快</strong>——所以暗適應模組做的是另外三件事：
      教你用<strong>餘光</strong>（視桿密度高峰在離中心 15–20 度，中心小凹幾乎沒有視桿，
      暗處直視等於把目標放在最不敏感的位置）、避免用亮光自己把暗適應歸零、
      以及用「眩光恢復計時」留下自己的基準線。暗適應明顯變慢是早期年齡相關性巨斑部病變、
      視網膜色素病變與維生素 A 缺乏的共同徵兆，及早發現比練習更有價值。
    </p>

    <h2>身體訓練在練什麼？</h2>
    <p style="color: var(--text-dim)">
      久坐傷害的不只是眼睛。<strong>等長運動</strong>（肌肉出力但關節不動）能在座位或牆邊補足核心與下肢肌力，
      並且是目前實證中降低靜態血壓效果最好的運動形式；<strong>骨盆底肌訓練</strong>（凱格爾運動）
      則強化承托骨盆腔器官的深層肌群，是國際指引列為應力性尿失禁的第一線治療。
      這兩者都不需器材、不會流汗，適合在護眼休息的空檔一起完成。
    </p>
    <p style="color: var(--text-dim)">
      <strong>安靜燃脂</strong>則是另一回事：它是真正的高強度間歇訓練，用來補上久坐族最缺的心肺耐力。
      心跳拉升靠的是「短時間內徵召大量肌肉」，而不是跳躍——深蹲與弓箭步動用的股四頭肌與臀肌是全身最大的肌群，
      快速反覆收縮時心臟必須立刻提高輸出，心跳自然竄高，雙腳完全不必離地。
      這正好解決公寓住戶的兩難：傳到樓下的是跳躍落地的<strong>衝擊音（固體傳音）</strong>，
      它沿著樓板結構直接傳遞，瑜珈墊只能衰減有限，唯一可靠的做法就是從源頭不產生衝擊。
    </p>

    <h2>靜脈回流在練什麼？</h2>
    <p style="color: var(--text-dim)">
      血液送到腳底之後，回程要逆著重力往上走，而這一段幾乎不靠心臟——靠的是<strong>小腿肌肉泵</strong>：
      小腿每收縮一次就擠壓深層靜脈把血往上推，靜脈內的單向瓣膜則負責在肌肉放鬆時關起來、不讓血液往下掉。
      久坐久站時小腿長時間不收縮，血液滯留、靜脈壓偏高，管壁被撐大、瓣膜關不緊，血液逆流後壓力又更高，
      形成會自我強化的惡性循環，也就是靜脈曲張。<strong>膝窩</strong>特別常見，是因為小隱靜脈正好在這裡匯入深層的膕靜脈，
      本身就是壓力集中的轉折點，加上坐姿時椅緣常壓在大腿後側與膝窩。
    </p>
    <p style="color: var(--text-dim)">
      期待要說清楚：<strong>運動不會讓已經曲張的血管消失</strong>。瓣膜被撐壞是結構性損傷，不會因訓練而復原。
      Padberg 等人 2004 年的隨機對照試驗讓患者做 6 個月小腿肌力訓練，小腿泵的射出分率與肌力確實顯著改善，
      但靜脈逆流本身沒有改變，生活品質與疾病嚴重度評分也沒有跟著進步；2023 年的 Cochrane 回顧
      （5 篇試驗、146 人）結論更保守，認為證據仍不足以判定運動對慢性靜脈疾病的好處。
      所以本站把它定位成<strong>日常保養</strong>：成本低、沒有副作用、順便練到小腿肌力與踝關節活動度，
      但不能取代醫療評估。
    </p>

    <h2>自律神經調節在練什麼？</h2>
    <p style="color: var(--text-dim)">
      自律神經由<strong>交感</strong>（油門）與<strong>副交感</strong>（煞車）組成，久坐與長期壓力會讓交感持續過度活躍，
      表現為心悸、胸悶、肩頸緊繃、腸胃不適與睡不好。呼吸是少數能被意識直接控制、又能立即影響自律神經的功能：
      吐氣時心跳自然變慢，把呼吸放慢到每分鐘約 6 次時，心跳與呼吸進入共振、HRV 振幅顯著提升，
      這是 HRV 生理回饋訓練的核心原理。本站提供共振呼吸、4-7-8、生理性嘆息、箱式呼吸、哼鳴呼吸
      與漸進式肌肉放鬆六種練習。
    </p>

    <h2>安全注意事項</h2>
    <div class="warn">
      ⚠️ <strong>眼睛訓練</strong>：高度近視（600 度以上）或有視網膜病變、剝離病史者，
      快速轉動眼球有視網膜剝離風險，請使用慢速安全模式並先諮詢眼科醫師。訓練中若出現閃光感、
      飛蚊突然增加、視野缺損、持續頭暈，請立即停止並就醫。<br /><br />
      ⚠️ <strong>等長運動</strong>：維持出力期間血壓會短暫升高，且憋氣（伐氏操作）會使血壓瞬間飆升。
      務必全程正常呼吸；有高血壓、心血管疾病、青光眼或視網膜病變者請先諮詢醫師。<br /><br />
      ⚠️ <strong>安靜燃脂（高強度間歇）</strong>：本站唯一的高強度項目。有未控制的高血壓、心血管疾病、
      近期手術、懷孕或膝踝下背舊傷者請先諮詢醫師，並從「深夜零落地」這類低衝擊課表開始。
      用力時吐氣、不要憋氣；出現胸痛、胸悶、心悸、頭暈、冒冷汗或呼吸困難請立刻停止並就醫。
      結束後務必原地慢走緩和，不要立刻坐下。<br /><br />
      ⚠️ <strong>骨盆底肌訓練</strong>：請勿反覆以「中斷尿流」作為練習方式。放鬆與收縮同樣重要，
      過度訓練可能造成骨盆底肌過度緊繃而引起疼痛或排尿困難；有骨盆疼痛或復健需求請諮詢專業人員。<br /><br />
      ⚠️ <strong>暗適應與眩光測試</strong>：眩光恢復計時會出現短暫強光，若有視網膜病變、偏頭痛畏光、
      近期眼部手術或正在服用光敏感藥物，請略過該項目。明暗交替的亮暗相都在 10 秒以上、
      屬緩慢交替而非閃爍，但有光敏性癲癇病史者仍請避免。本頁的測量不是臨床檢查，
      只能與自己過去在相同螢幕與相同房間亮度下的紀錄比較，不可用於自我診斷。<br /><br />
      ⚠️ <strong>靜脈回流訓練</strong>：若<strong>單側</strong>小腿突然腫脹、發熱、壓痛，可能是深層靜脈栓塞（DVT），
      請立即就醫，不要按摩也不要先做運動。膝窩摸到腫塊不一定是靜脈曲張——貝克氏囊腫、小隱靜脈瘤、
      膕動脈瘤都長在同一個位置，需要超音波才能分辨。皮膚變硬變色、反覆濕疹或有不易癒合的傷口，
      請掛心臟血管外科。<br /><br />
      ⚠️ <strong>呼吸練習</strong>：出現頭暈、手腳發麻或刺痛代表換氣過度，請立即停止並回到自然呼吸。
      含屏息的技巧若您懷孕、有心血管疾病、癲癇病史或正在恐慌發作，請縮短或略過屏息段落。
    </div>

    <h2>設定</h2>
    <div class="controls">
      <label><input type="checkbox" v-model="settings.sound" /> 提示音</label>
      <label><input type="checkbox" v-model="settings.voice" /> 語音引導</label>
      <span style="color: var(--text-dim)">
        目前安全模式：{{ settings.risk === 'high' ? '⚠️ 慢速安全模式' : '一般模式' }}
      </span>
      <button @click="resetRisk">重新填寫安全問卷</button>
    </div>

    <h2>參考資料</h2>
    <ul style="margin: 8px 0 8px 24px; font-size: 0.9rem">
      <li><a href="https://edh.tw/articles/2J9hTkX" target="_blank">早安健康：睫狀肌訓練（遠近凝視法）</a></li>
      <li><a href="https://www.top1health.com/article/22943" target="_blank">華人健康網：護眼建議</a></li>
      <li><a href="https://www.azofreeware.com/2020/02/ispeedreading.html" target="_blank">iSpeedReading 速讀眼球訓練</a></li>
      <li><a href="https://www.books.com.tw/products/0010660839" target="_blank">《看看圖，視力就回復》30 日活化眼球訓練操（藏輪圖出處）</a></li>
      <li><a href="https://www.books.com.tw/products/0010734945" target="_blank">《1分鐘變鷹眼：3D立體視力回復法》</a></li>
      <li><a href="https://zh.wikipedia.org/zh-tw/%E7%AB%8B%E4%BD%93%E5%9B%BE" target="_blank">Autostereogram（立體圖）原理 - Wikipedia</a></li>
      <li><a href="https://heho.com.tw/archives/32297" target="_blank">Heho 健康：眼球操的效果與限制（長庚醫師）</a></li>
      <li><a href="https://health.businessweekly.com.tw/article/ARTL000049619" target="_blank">良醫健康網：眼球操真相與風險</a></li>
      <li><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC12989405/" target="_blank">等長運動與血壓調節：隨機對照試驗系統性回顧與統合分析</a></li>
      <li><a href="https://health.udn.com/health/story/5977/7352444" target="_blank">元氣網：等長運動比有氧更能降血壓</a></li>
      <li><a href="https://www.nice.org.uk/guidance/ng210/chapter/recommendations" target="_blank">NICE NG210：骨盆底功能障礙的預防與非手術治療指引</a></li>
      <li><a href="https://www.nhsinform.scot/healthy-living/womens-health/middle-years-around-25-to-50-years/pelvic-health/pelvic-floor-muscles/" target="_blank">NHS inform：骨盆底肌訓練方法</a></li>
      <li><a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5575449/" target="_blank">共振頻率呼吸對 HRV、血壓與情緒的影響</a></li>
      <li><a href="https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2021.624254/full" target="_blank">Frontiers：各種呼吸技巧對 HRV 的效果比較</a></li>
      <li><a href="https://tanss.org.tw/qa/" target="_blank">台灣自律神經失調症協會：常見問題</a></li>
      <li><a href="https://webvision.med.utah.edu/book/part-viii-gabac-receptors/light-and-dark-adaptation/" target="_blank">Webvision（猶他大學）：Light and Dark Adaptation 明暗適應</a></li>
      <li><a href="https://www.ncbi.nlm.nih.gov/books/NBK11525/" target="_blank">Neuroscience（NCBI Bookshelf）：視錐與視桿的適應時程</a></li>
      <li><a href="https://eandv.biomedcentral.com/articles/10.1186/s40662-016-0060-8" target="_blank">Eye and Vision：葉黃素與玉米黃素補充對眩光下視覺表現與眩光恢復的隨機對照試驗</a></li>
      <li><a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11809839/" target="_blank">維生素 A 缺乏與夜盲：視紫質再生障礙的機制與病例</a></li>
      <li><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC10779901/" target="_blank">夜間近視（night myopia）的成因：暗焦點、球面與色差</a></li>
      <li><a href="https://pubmed.ncbi.nlm.nih.gov/10536127/" target="_blank">Cole et al., NEJM 1999：運動後心率恢復與死亡率（HRR₁ 12 下門檻的出處）</a></li>
      <li><a href="https://pubmed.ncbi.nlm.nih.gov/8897392/" target="_blank">Tabata et al., 1996：中強度持續訓練與高強度間歇訓練的比較（20/10 間歇的原始研究）</a></li>
      <li><a href="https://www.acefitness.org/resources/everyone/blog/3791/everything-you-need-to-know-about-tabata-training/" target="_blank">ACE：Tabata 訓練的原始方案與常見誤解</a></li>
      <li><a href="https://pubmed.ncbi.nlm.nih.gov/14718821/" target="_blank">Padberg et al., 2004：結構化運動改善慢性靜脈功能不全的小腿肌肉泵功能（隨機對照試驗）</a></li>
      <li><a href="https://pubmed.ncbi.nlm.nih.gov/28873064/" target="_blank">2017 系統性回顧與統合分析：運動對小腿肌肉泵射出分率的效果</a></li>
      <li><a href="https://www.cochrane.org/CD010637/PVD_can-physical-exercise-improve-blood-flow-through-veins" target="_blank">Cochrane：運動能否改善慢性靜脈疾病（證據仍不足）</a></li>
      <li><a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8147883/" target="_blank">系統性回顧：運動訓練對小腿泵功能、肌力、踝關節活動度與生活品質的影響</a></li>
      <li><a href="https://www.cochrane.org/CD008819/PVD_compression-stockings-initial-treatment-varicose-veins-patients-without-venous-ulceration" target="_blank">Cochrane：彈性襪作為靜脈曲張初始治療的證據回顧</a></li>
      <li><a href="https://www.nice.org.uk/guidance/cg168/chapter/Recommendations" target="_blank">NICE CG168：下肢靜脈曲張的診斷與處置指引（含轉診時機）</a></li>
    </ul>

    <p style="color: var(--text-dim); font-size: 0.85rem; margin-top: 16px">
      EyeTrainer v0.1 — 本工具為保健放鬆用途，非醫療器材。
    </p>
  </div>
</template>
