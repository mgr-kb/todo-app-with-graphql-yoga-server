const __importDefault =
	(this && this.__importDefault) ||
	((mod) => (mod?.__esModule ? mod : { default: mod }));
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const graphql_yoga_1 = require("graphql-yoga");
// 1. GraphQL スキーマ定義 (TypeDefs)
// 最もシンプルな例として、"hello" クエリを定義
const typeDefs = /* GraphQL */ `
  type Query {
    hello: String!
    ping: String!
  }
`;
// 2. リゾルバ定義
// スキーマの各フィールドに対応するデータを返す関数
const resolvers = {
	Query: {
		hello: () => "world!", // hello クエリは "world!" 文字列を返す
		ping: () => "pong", // ping クエリは "pong" 文字列を返す
	},
};
// 3. GraphQL Yoga インスタンス作成
const yoga = (0, graphql_yoga_1.createYoga)({
	schema: (0, graphql_yoga_1.createSchema)({
		// スキーマとリゾルバから実行可能なスキーマを作成
		typeDefs,
		resolvers,
	}),
	// GraphiQL（ブラウザで使えるGraphQL IDE）のエンドポイント設定
	// デフォルトは `/graphql` なので、通常はこのままでOK
	graphqlEndpoint: "/graphql",
	// CORS設定（必要に応じて開発環境のフロントエンドオリジンを追加）
	cors: {
		origin: ["http://localhost:3000"], // 例: Next.js開発サーバー
		credentials: true,
		allowedHeaders: ["Content-Type", "Authorization"],
		methods: ["POST"],
	},
});
// 4. Express アプリケーション作成
const app = (0, express_1.default)();
// 5. 特定のパスで Yoga ミドルウェアを使用
// `/graphql` へのリクエストを Yoga が処理するように設定
app.use(yoga.graphqlEndpoint, yoga);
// (オプション) ルートパスへの簡単な応答
app.get("/", (req, res) => {
	res.send("GraphQL Server is running! Access GraphQL at /graphql");
});
// 6. Express サーバー起動
const port = process.env.PORT || 4000;
app.listen(port, () => {
	console.log(
		`🚀 GraphQL Server ready at http://localhost:${port}${yoga.graphqlEndpoint}`,
	);
});
