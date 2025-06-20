const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const PORT = process.env.PORT || 3000;

// Claude API初期化
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

// ミドルウェア
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// 静的ファイル配信
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// タイトル生成API
app.post('/api/generate-titles', async (req, res) => {
    try {
        const { target, accountTheme, postTheme } = req.body;
        
        if (!target || !accountTheme || !postTheme) {
            return res.status(400).json({ error: '必要な項目が不足しています' });
        }

        const prompt = `
あなたは優秀なInstagram運用代行者です。以下の条件に基づいて、魅力的なInstagram投稿タイトルを10個提案してください。

【条件】
- ターゲット: ${target}
- アカウントの発信軸: ${accountTheme}
- 投稿テーマ: ${postTheme}

【要求】
- ターゲットが続きを読みたくなるキャッチーでインパクトのあるタイトル
- 絵文字を効果的に使用
- 各タイトルは30文字以内
- 投稿テーマが「おまかせ」の場合は、ターゲットが悩んでいそうなことや興味を持ちそうな内容

10個のタイトルを番号付きリストで出力してください。
`;

        const message = await anthropic.messages.create({
            model: 'claude-3-sonnet-20240229',
            max_tokens: 1000,
            messages: [{ role: 'user', content: prompt }]
        });

        const titles = message.content[0].text
            .split('\n')
            .filter(line => line.match(/^\d+\./))
            .map(line => line.replace(/^\d+\.\s*/, '').trim());

        res.json({ titles });
    } catch (error) {
        console.error('タイトル生成エラー:', error);
        res.status(500).json({ error: 'タイトル生成に失敗しました' });
    }
});

// 投稿内容生成API
app.post('/api/generate-content', async (req, res) => {
    try {
        const { target, accountTheme, postTheme, selectedTitle, pageCount } = req.body;
        
        if (!target || !accountTheme || !postTheme || !selectedTitle || !pageCount) {
            return res.status(400).json({ error: '必要な項目が不足しています' });
        }

        const prompt = `
あなたは優秀なInstagram運用代行者です。以下の条件に基づいて、Instagram投稿の内容を作成してください。

【条件】
- ターゲット: ${target}
- アカウントの発信軸: ${accountTheme}
- 投稿テーマ: ${postTheme}
- 選択されたタイトル: ${selectedTitle}
- ページ数: ${pageCount}ページ（表紙とサンクスページを除く）

【構成要求】
- 全体をPREP法（結論→理由→実例→まとめ）で構成
- 1枚目は結論ページ
- 2枚目以降は本編（1ページ1メッセージ）
- 最終ページはCTA（まとめ・行動促進）

【各ページの形式】
- 見出し1: 15文字以内のページタイトル
- 見出し2: 15文字以内の結論・サブタイトル
- 本文: 30-50文字以内の説明文

【出力形式】
以下のJSONフォーマットで出力してください：
{
  "pages": [
    {
      "title": "見出し1",
      "subtitle": "見出し2", 
      "content": "本文"
    }
  ]
}

中学生にも分かる言葉で、丁寧語で作成してください。
`;

        const message = await anthropic.messages.create({
            model: 'claude-3-sonnet-20240229',
            max_tokens: 2000,
            messages: [{ role: 'user', content: prompt }]
        });

        let responseText = message.content[0].text;
        
        // JSONを抽出
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const contentData = JSON.parse(jsonMatch[0]);
            res.json(contentData);
        } else {
            // JSON形式でない場合のフォールバック
            const pages = [];
            const lines = responseText.split('\n').filter(line => line.trim());
            
            for (let i = 0; i < pageCount; i++) {
                pages.push({
                    title: `ページ${i + 1}`,
                    subtitle: 'サブタイトル',
                    content: `${selectedTitle}に関する内容をここに記載します。`
                });
            }
            
            res.json({ pages });
        }
    } catch (error) {
        console.error('内容生成エラー:', error);
        res.status(500).json({ error: '内容生成に失敗しました' });
    }
});

// サーバー起動
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Claude API Key:', process.env.ANTHROPIC_API_KEY ? '設定済み' : '未設定');
});