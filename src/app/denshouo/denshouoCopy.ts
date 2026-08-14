export const DENSHOUO_COPY = {
    ja: {
        returnToOrbit: 'うみからでる',
        lead: '小さな幸せを魚に乗せて流し、時間が経つと海の向こうへ消えていく SNS。',
        overview: '小さな幸せをおさかなに乗せて流し、時間が経つとどこかへ泳いでいく、気軽さ重視の投稿体験を目指したアプリです。「気兼ねなく流せること」と「ちょっとした幸せを誰かと分かち合えること」を中心に設計しました。',
        smallHappiness: '大げさな発信ではなく、日常の小さな幸せを軽く流せることを重視。時間経過で投稿が流れていくため、心理的ハードルを下げています。',
        lightShadow: '幸せだけでなく、少しダークな感情も含めて海に流せる世界観を持たせ、単なるメモアプリではない情緒を加えました。',
        frontend: 'React、TypeScript、Vite、Tailwind CSS を中心に構築。魚ごとのコンポーネント管理を行い、時間が足りない場面では CSS アニメーションも併用して完成度を優先しました。',
        backend: 'ハッカソン開発での学習コストと速度を考慮し、バックエンドとデータベースを兼ねられる Supabase を採用。定期実行ジョブを使い、時間差でデータが消える仕様も実現しました。',
        context: '2025 年の技育CAMP Vol.10 にて開発。チームメンバーは全員 1 回生で、使う技術の多くが初挑戦という状態からスタートしました。その中で、学習コストと実装速度のバランスを取りながら形にし、優秀賞を受賞したプロジェクトです。',
    },
    en: {
        returnToOrbit: 'Exit the Sea',
        lead: 'An SNS where you place a small happiness on a fish and let it drift away over time.',
        overview: 'This app focuses on lightweight posting: place a small happy moment on a fish and let it swim away over time. It was designed around two ideas: being easy to post without pressure, and sharing small moments of joy with someone.',
        smallHappiness: 'Instead of dramatic broadcasting, it emphasizes casually sharing tiny daily happiness. Posts drift away over time, which lowers the psychological barrier to posting.',
        lightShadow: 'The world also accepts slightly darker emotions, not only happy ones, adding emotional depth beyond a simple memo app.',
        frontend: 'Built mainly with React, TypeScript, Vite, and Tailwind CSS. We managed fish-based components and used CSS animations pragmatically where needed to maximize polish within time constraints.',
        backend: 'Considering learning cost and development speed in a hackathon setting, we chose Supabase to cover both backend and database. Scheduled jobs were used to implement delayed data disappearance behavior.',
        context: 'Developed at GeekCamp Vol.10 in 2025. All team members were first-year students, and many technologies were first-time challenges. We balanced learning cost with implementation speed and completed the project to an Excellence Award level.',
    },
} as const;

export type DenshouoCopy = (typeof DENSHOUO_COPY)[keyof typeof DENSHOUO_COPY];
