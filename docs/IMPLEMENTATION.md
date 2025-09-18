# Hero Image Implementation Documentation

## 概要

このプロジェクトは、Canvas を使った波打つディザリング効果を持つヒーローセクションの実装です。マウスの動きに反応し、スクロールに連動したアニメーション効果を提供します。

## 技術スタック

- **Vite** - 開発環境とビルドツール
- **Vanilla JavaScript** - フレームワークなしの実装
- **Canvas API** - リアルタイム描画
- **CSS3** - アニメーションとレイアウト

## プロジェクト構成

```
/
├── docs/
│   ├── ref-01.png          # 参考画像 (緑色ディザリングパターン)
│   ├── ref-02.png          # 参考画像 (動的ノイズパターン)
│   ├── ref-03.png          # 参考画像 (グラデーション効果)
│   └── IMPLEMENTATION.md   # この文書
├── src/
│   ├── dither.js          # メインアニメーションクラス
│   ├── main.js            # エントリーポイント
│   └── style.css          # スタイル定義
├── index.html             # HTMLテンプレート
└── package.json           # プロジェクト設定
```

## 核心技術

### 1. Bayerディザリング

4x4のBayerマトリックスを使用してディザリングパターンを生成：

```javascript
bayerMatrix4x4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5]
];
```

### 2. 波動関数

左から右へのフロー効果とマウス追従を組み合わせた数学的アプローチ：

```javascript
// 水平フロー (左→右)
const flowPhase = normalizedX * 6 - time * 0.0008 + this.scrollOffset;
const mainFlow = Math.sin(flowPhase) * 0.5;

// 垂直波
const verticalWave = Math.sin(normalizedY * 3 + time * 0.0005) * 0.4;

// マウス影響
const mouseInfluence = Math.exp(-distance * 4) * Math.sin(distance * 12 - time * 0.004) * 0.3;
```

### 3. パーティクル密度制御

より自然な見た目のための密度調整：

```javascript
const adjustedThreshold = bayerThreshold + (1 - bayerThreshold) * this.densityReduction;
```

## 主要クラス: DitherBackground

### 設定可能パラメータ

```javascript
// 色設定 (#000 = 黒)
this.particleColor = { r: 0, g: 0, b: 0 };

// 基本透明度 (0-255)
this.baseOpacity = 50;

// 密度減少率 (0-1, 高いほど少ない粒子)
this.densityReduction = 0.3;

// ピクセルサイズ (細かい粒子用)
this.pixelSize = 2;
```

### 主要メソッド

#### `flowFunction(x, y, time, mouseX, mouseY)`
波動効果を計算する核心メソッド。左右フロー、垂直波、マウス影響、ノイズを組み合わせ。

#### `generateFrame()`
毎フレームの描画処理。Bayerディザリングを適用し、Canvas ImageDataを更新。

#### `setScrollOffset(offset)`
スクロール連動でフロー速度を制御。

## スクロールアニメーション

### トリガーポイント
- viewport の 75% スクロール時に効果発動
- canvas のみがフェードアウト（ヒーローコンテンツは常時表示）

### アニメーション段階

1. **通常状態**: 基本的な波動効果
2. **スクロール進行**: 段階的にフロー加速
3. **消失**: 1.5秒でフェードアウト + 強力フロー効果
4. **復帰**: 1.2秒でフェードイン + フロー正常化

## CSS アニメーション

```css
#dither-canvas {
  transition: opacity 1.5s ease-out;
}

#dither-canvas.flow-out {
  opacity: 0;
}

#dither-canvas.flow-in {
  opacity: 1;
  transition: opacity 1.2s ease-in;
}
```

## カスタマイズガイド

### 色の変更
`src/dither.js` の `particleColor` を変更：

```javascript
// 例: 青色に変更
this.particleColor = { r: 0, g: 100, b: 255 };
```

### 密度の調整
`densityReduction` 値を変更（0-1範囲）：

```javascript
this.densityReduction = 0.5; // より少ない粒子
this.densityReduction = 0.1; // より多い粒子
```

### 波の速度調整
`flowFunction` 内の `flowSpeed` を変更：

```javascript
const flowSpeed = 0.001; // より高速
const flowSpeed = 0.0005; // より低速
```

### 背景色の変更
`src/style.css` の body background を変更：

```css
body {
  background: #f0f0f0; /* 例: より明るいグレー */
}
```

## パフォーマンス考慮事項

### 最適化要素
- **ImageData直接操作**: DOMアップデートを回避
- **pixelSize=2**: 描画負荷を1/4に削減  
- **requestAnimationFrame**: ブラウザ最適化フレームレート
- **マウス補間**: 滑らかな動きのための遅延適用

### 推奨設定値
- `pixelSize`: 1-4 (1=最高品質、4=最高パフォーマンス)
- `baseOpacity`: 20-100 (低い値=より繊細)
- `densityReduction`: 0.2-0.5 (高い値=軽量)

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# プロダクションビルド
npm run build

# プレビュー
npm run preview
```

## 参考技術資料

1. **CodePen波動効果**: https://codepen.io/tinyrebel/pen/xNwQRE
   - マウス追従波動の基本アプローチ

2. **Codrops Bayerディザリング**: https://tympanus.net/codrops/2025/07/30/interactive-webgl-backgrounds-a-quick-guide-to-bayer-dithering/
   - ディザリング技術の詳細解説

3. **Featured Projects**: https://featuredprojects.jp/
   - 最終的な視覚目標の参考サイト

## 拡張可能性

### 今後の改良候補
- WebGL実装による更なる高速化
- 複数カラーパレット対応
- 3D効果の追加
- モバイル最適化
- プリセット設定システム

### API拡張案
```javascript
// 将来的な設定API例
ditherBg.setColorScheme(['#000', '#333', '#666']);
ditherBg.setWaveIntensity(0.8);
ditherBg.enableMobileOptimization(true);
```

## トラブルシューティング

### よくある問題

**Canvas が表示されない**
- デバイスピクセル比の問題: `resize()` メソッドを確認
- Canvas サイズが正しく設定されているか確認

**アニメーションが重い**
- `pixelSize` を増やす (2→4)
- `densityReduction` を上げる (0.3→0.5)

**マウス追従が遅い**
- マウス補間率を上げる: `this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.15`

**スクロールアニメーションが動作しない**
- イベントリスナーが正しく設定されているか確認
- CSS transition が適用されているか確認

---

このドキュメントにより、実装の全体像と詳細な技術仕様を把握し、同等の効果を再現可能です。