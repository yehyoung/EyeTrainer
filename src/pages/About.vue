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
    </ul>

    <h2>誠實的期待管理</h2>
    <p style="color: var(--text-dim)">
      眼球訓練<strong>無法治療真性近視</strong>——已拉長的眼軸不會因訓練縮短。
      它的價值在於：放鬆緊繃的睫狀肌（改善假性近視與視疲勞）、緩解電腦視覺症候群、
      維持眼球運動的靈活度。若視力持續惡化，請以眼科診療為準。
    </p>

    <h2>身體訓練在練什麼？</h2>
    <p style="color: var(--text-dim)">
      久坐傷害的不只是眼睛。<strong>等長運動</strong>（肌肉出力但關節不動）能在座位或牆邊補足核心與下肢肌力，
      並且是目前實證中降低靜態血壓效果最好的運動形式；<strong>骨盆底肌訓練</strong>（凱格爾運動）
      則強化承托骨盆腔器官的深層肌群，是國際指引列為應力性尿失禁的第一線治療。
      兩者都不需器材、不會流汗，適合在護眼休息的空檔一起完成。
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
      ⚠️ <strong>骨盆底肌訓練</strong>：請勿反覆以「中斷尿流」作為練習方式。放鬆與收縮同樣重要，
      過度訓練可能造成骨盆底肌過度緊繃而引起疼痛或排尿困難；有骨盆疼痛或復健需求請諮詢專業人員。<br /><br />
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
    </ul>

    <p style="color: var(--text-dim); font-size: 0.85rem; margin-top: 16px">
      EyeTrainer v0.1 — 本工具為保健放鬆用途，非醫療器材。
    </p>
  </div>
</template>
