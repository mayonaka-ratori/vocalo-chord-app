---
name: deploy
description: Vercel にデプロイする
---

# デプロイワークフロー

## ステップ

1. **ビルド確認**
   `/test-and-verify` ワークフローを実行

2. **環境変数確認**
   - `GEMINI_API_KEY` が Vercel の環境変数に設定されていることを確認
   - クライアントサイドのコードに API キーが漏れていないことを確認

3. **Git コミット & プッシュ**
   ```bash
   git add .
   git commit -m "適切なConventional Commitメッセージ"
   git push origin main
   ```

4. **Vercel デプロイ確認**
   - Vercel のダッシュボードでデプロイが成功したことを確認
   - デプロイされたURLにアクセスして動作確認する

5. **本番環境確認**
   - PC ブラウザで動作確認
   - スマホ実機（可能なら）で動作確認
   - Tone.js の音声再生が正常に動作することを確認（HTTPS必須）
