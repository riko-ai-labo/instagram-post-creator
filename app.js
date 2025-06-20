// Instagram投稿作成データ
let instagramData = {
    target: '',
    accountTheme: '',
    postTheme: '',
    selectedTitle: '',
    pageCount: 5,
    content: []
};

let currentData = [];
let selectedTitleIndex = -1;

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
    showStep(1);
});

// ステップ表示制御
function showStep(stepNumber) {
    // 全てのステップを非表示
    for (let i = 1; i <= 3; i++) {
        document.getElementById(`step${i}`).classList.remove('active');
        document.getElementById(`stepContent${i}`).classList.remove('active');
    }
    
    // 指定されたステップを表示
    document.getElementById(`step${stepNumber}`).classList.add('active');
    document.getElementById(`stepContent${stepNumber}`).classList.add('active');
}

// タイトル案を生成
async function generateTitles() {
    const target = document.getElementById('target').value.trim();
    const accountTheme = document.getElementById('accountTheme').value.trim();
    const postTheme = document.getElementById('postTheme').value.trim();
    
    if (!target || !accountTheme || !postTheme) {
        alert('全ての項目を入力してください。');
        return;
    }
    
    instagramData.target = target;
    instagramData.accountTheme = accountTheme;
    instagramData.postTheme = postTheme;
    
    // ローディング表示
    showLoading('タイトル案を生成中...');
    
    try {
        // APIからタイトル案を取得
        const response = await fetch('/api/generate-titles', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                target,
                accountTheme,
                postTheme
            })
        });
        
        if (!response.ok) {
            throw new Error('タイトル生成に失敗しました');
        }
        
        const data = await response.json();
        hideLoading();
        
        displayTitleOptions(data.titles);
        showStep(2);
    } catch (error) {
        hideLoading();
        console.error('Error:', error);
        
        // フォールバック: 既存のローカル生成を使用
        const titles = generateTitleSuggestions(target, accountTheme, postTheme);
        displayTitleOptions(titles);
        showStep(2);
        
        alert('AIによる生成が利用できません。サンプルタイトルを表示しています。\n※クレジット不足またはネットワークエラーです。');
    }
}

// タイトル案生成ロジック
function generateTitleSuggestions(target, accountTheme, postTheme) {
    const isOmakase = postTheme.toLowerCase().includes('おまかせ');
    
    if (isOmakase) {
        return [
            '📱 忙しい毎日でも続けられる！効率アップの秘訣',
            '⏰ たった5分で変わる！朝の時短ルーティン',
            '💡 知らなきゃ損！プロが教える仕事術',
            '🎯 成果を出す人がやっている3つの習慣',
            '✨ 自分時間を作る！優先順位の付け方',
            '🚀 スキルアップしたい人必見！学習法',
            '💪 挫折しない！目標達成のコツ',
            '🌟 今すぐ実践！ストレス解消法',
            '📈 収入アップに繋がる副業の始め方',
            '🎉 毎日を楽しくする小さな工夫'
        ];
    } else {
        return [
            `📱 ${postTheme}で人生が変わる！実践者の声`,
            `⚡ 3分で分かる！${postTheme}の基本`,
            `💡 ${postTheme}で失敗しない5つのポイント`,
            `🎯 ${postTheme}初心者が知るべきこと`,
            `✨ ${postTheme}で効果を出すコツ`,
            `🚀 ${postTheme}のプロが教える秘訣`,
            `💪 ${postTheme}で成功する人の特徴`,
            `🌟 ${postTheme}を始める前に知っておきたいこと`,
            `📈 ${postTheme}で結果を出すまでの道のり`,
            `🎉 ${postTheme}で変わった私の体験談`
        ];
    }
}

// タイトル選択肢を表示
function displayTitleOptions(titles) {
    const titleOptions = document.getElementById('titleOptions');
    titleOptions.innerHTML = '';
    
    titles.forEach((title, index) => {
        const option = document.createElement('div');
        option.className = 'title-option';
        option.textContent = title;
        option.onclick = () => selectTitle(index, title);
        titleOptions.appendChild(option);
    });
}

// タイトル選択
function selectTitle(index, title) {
    // 前の選択を解除
    document.querySelectorAll('.title-option').forEach(opt => opt.classList.remove('selected'));
    
    // 新しい選択を設定
    document.querySelectorAll('.title-option')[index].classList.add('selected');
    selectedTitleIndex = index;
    instagramData.selectedTitle = title;
    
    document.getElementById('createPostBtn').style.display = 'block';
}

// 投稿作成画面へ
function createPost() {
    if (selectedTitleIndex === -1) {
        alert('タイトルを選択してください。');
        return;
    }
    showStep(3);
}

// 投稿内容を生成
async function generateContent() {
    const pageCount = parseInt(document.getElementById('pageCount').value);
    instagramData.pageCount = pageCount;
    
    // ローディング表示
    showLoading('投稿内容を生成中...');
    
    try {
        // APIから投稿内容を取得
        const response = await fetch('/api/generate-content', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                target: instagramData.target,
                accountTheme: instagramData.accountTheme,
                postTheme: instagramData.postTheme,
                selectedTitle: instagramData.selectedTitle,
                pageCount: pageCount
            })
        });
        
        if (!response.ok) {
            throw new Error('投稿内容生成に失敗しました');
        }
        
        const data = await response.json();
        hideLoading();
        
        // APIレスポンスをテーブル形式に変換
        const content = data.pages.map(page => [
            page.title,
            page.subtitle,
            page.content
        ]);
        
        instagramData.content = content;
        currentData = {
            columns: ['見出し', 'サブタイトル', '本文'],
            data: content
        };
        
        displayContentPreview(content);
        renderTable(['見出し', 'サブタイトル', '本文'], content);
        
    } catch (error) {
        hideLoading();
        console.error('Error:', error);
        
        // フォールバック: 既存のローカル生成を使用
        const content = generateInstagramContent(instagramData, pageCount);
        instagramData.content = content;
        
        currentData = {
            columns: ['見出し', 'サブタイトル', '本文'],
            data: content
        };
        
        displayContentPreview(content);
        renderTable(['見出し', 'サブタイトル', '本文'], content);
        
        alert('AIによる生成が利用できません。サンプル内容を表示しています。\n※クレジット不足またはネットワークエラーです。');
    }
}

// Instagram投稿内容生成（PREP法）
function generateInstagramContent(data, pageCount) {
    const content = [];
    
    // 1枚目（結論ページ）
    content.push([
        data.selectedTitle,
        '今日から実践可能',
        `${data.target}の皆さん、${data.postTheme}について分かりやすく解説します。すぐに実践できる内容をお届けします。`
    ]);
    
    // 本編ページ（PREP法）
    const topics = generateTopics(data.postTheme, pageCount - 2);
    
    topics.forEach((topic, index) => {
        content.push([
            `${index + 1}. ${topic.title}`,
            topic.subtitle,
            topic.content
        ]);
    });
    
    // 最終ページ（CTA）
    content.push([
        'まとめ',
        '今日から始めよう',
        '今回の内容が役に立ったら、ぜひ保存・シェアしてください。質問があればコメントでお聞かせください！'
    ]);
    
    return content;
}

// トピック生成
function generateTopics(theme, count) {
    const topics = [];
    const isOmakase = theme.toLowerCase().includes('おまかせ');
    
    if (isOmakase) {
        const defaultTopics = [
            { title: '時間管理術', subtitle: '効率的な時間の使い方', content: '優先順位を明確にして、重要なタスクから取り組むことで、限られた時間を有効活用できます。' },
            { title: '習慣化のコツ', subtitle: '継続は力なり', content: '小さな行動から始めて、毎日同じ時間に実行することで、自然と習慣として身につきます。' },
            { title: 'モチベーション維持', subtitle: '継続するための秘訣', content: '目標を明確にして、進捗を可視化することで、モチベーションを維持しやすくなります。' },
            { title: 'ストレス管理', subtitle: '心の健康を保つ方法', content: '適度な休息と運動を取り入れることで、ストレスを軽減し、パフォーマンスを向上させます。' },
            { title: '学習方法', subtitle: '効率的な知識習得', content: 'アウトプットを意識した学習により、知識の定着率を大幅に向上させることができます。' }
        ];
        
        for (let i = 0; i < Math.min(count, defaultTopics.length); i++) {
            topics.push(defaultTopics[i]);
        }
    } else {
        for (let i = 0; i < count; i++) {
            topics.push({
                title: `${theme}のポイント${i + 1}`,
                subtitle: `実践的なアプローチ`,
                content: `${theme}において重要な要素を実践的な視点から解説します。すぐに活用できる具体的な方法をご紹介します。`
            });
        }
    }
    
    return topics;
}

// 内容プレビュー表示
function displayContentPreview(content) {
    const preview = document.getElementById('contentPreview');
    let html = '<h4>投稿内容プレビュー</h4>';
    
    content.forEach((page, index) => {
        html += `
            <div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px;">
                <h5>${index + 1}枚目</h5>
                <strong>${page[0]}</strong><br>
                <em>${page[1]}</em><br>
                <p>${page[2]}</p>
            </div>
        `;
    });
    
    preview.innerHTML = html;
}

// 表をHTMLで描画
function renderTable(columns, data) {
    const outputDiv = document.getElementById('outputTable');
    
    let html = '<table>';
    
    // ヘッダー行
    html += '<thead><tr>';
    columns.forEach(col => {
        html += `<th>${escapeHtml(col)}</th>`;
    });
    html += '</tr></thead>';
    
    // データ行
    html += '<tbody>';
    data.forEach((row, rowIndex) => {
        html += '<tr>';
        row.forEach((cell, cellIndex) => {
            html += `<td><input type="text" value="${escapeHtml(cell)}" onchange="updateCell(${rowIndex}, ${cellIndex}, this.value)"></td>`;
        });
        html += '</tr>';
    });
    html += '</tbody>';
    
    html += '</table>';
    outputDiv.innerHTML = html;
}

// セルの値を更新
function updateCell(rowIndex, cellIndex, value) {
    if (currentData && currentData.data[rowIndex]) {
        currentData.data[rowIndex][cellIndex] = value;
    }
}

// HTMLエスケープ
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// CSVダウンロード
function downloadCSV() {
    if (!currentData || !currentData.data.length) {
        alert('表を生成してからダウンロードしてください。');
        return;
    }
    
    let csvContent = '';
    
    // ヘッダー行を追加
    csvContent += currentData.columns.map(col => `"${col}"`).join(',') + '\n';
    
    // データ行を追加
    currentData.data.forEach(row => {
        csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
    });
    
    // BOMを追加（Excel対応）
    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // ダウンロード
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'output.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 表をクリップボードにコピー
function copyTable() {
    if (!currentData || !currentData.data.length) {
        alert('表を生成してからコピーしてください。');
        return;
    }
    
    let textContent = '';
    
    // ヘッダー行
    textContent += currentData.columns.join('\t') + '\n';
    
    // データ行
    currentData.data.forEach(row => {
        textContent += row.join('\t') + '\n';
    });
    
    // クリップボードにコピー
    navigator.clipboard.writeText(textContent).then(() => {
        alert('表がクリップボードにコピーされました。');
    }).catch(err => {
        console.error('コピーに失敗しました:', err);
        alert('コピーに失敗しました。');
    });
}

// ローディング表示
function showLoading(message) {
    const loadingDiv = document.getElementById('loading') || createLoadingElement();
    loadingDiv.textContent = message;
    loadingDiv.style.display = 'block';
}

// ローディング非表示
function hideLoading() {
    const loadingDiv = document.getElementById('loading');
    if (loadingDiv) {
        loadingDiv.style.display = 'none';
    }
}

// ローディング要素作成
function createLoadingElement() {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loading';
    loadingDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 20px;
        border-radius: 10px;
        z-index: 1000;
        display: none;
    `;
    document.body.appendChild(loadingDiv);
    return loadingDiv;
}

// 全てクリア
function clearAll() {
    // 各入力フィールドをクリア
    document.getElementById('target').value = '';
    document.getElementById('accountTheme').value = '';
    document.getElementById('postTheme').value = '';
    document.getElementById('outputTable').innerHTML = '';
    document.getElementById('titleOptions').innerHTML = '';
    document.getElementById('contentPreview').innerHTML = '';
    
    // データをリセット
    instagramData = {
        target: '',
        accountTheme: '',
        postTheme: '',
        selectedTitle: '',
        pageCount: 5,
        content: []
    };
    currentData = [];
    selectedTitleIndex = -1;
    
    // ステップ1に戻る
    showStep(1);
}