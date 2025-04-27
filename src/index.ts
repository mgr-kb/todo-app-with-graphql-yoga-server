import fs from "node:fs"; // Node.jsのファイルシステムモジュールをインポート
import path from "node:path"; // Node.jsのパスモジュールをインポート
import express from "express";
import type { Request, Response } from "express";
import { createSchema, createYoga } from "graphql-yoga";

type Todo = {
	id: string;
	text: string;
	completed: boolean;
};
const todos: Todo[] = [
	{
		id: "1",
		text: "Learn GraphQL",
		completed: true,
	},
	{
		id: "2",
		text: "Build a GraphQL server",
		completed: false,
	},
];
let nextTodoId = todos.length + 1; // IDの初期化を修正

// 1. GraphQL スキーマ定義 (TypeDefs) をファイルから読み込む
const typeDefs = fs.readFileSync(
	path.join(__dirname, "schema.graphql"), // カレントディレクトリにある schema.graphql を指定
	"utf-8", // 文字コードを指定
);

// 2. リゾルバ定義
// スキーマの各フィールドに対応するデータを返す関数
const resolvers = {
	Query: {
		hello: (): string => "world!", // hello クエリは "world!" 文字列を返す
		ping: (): string => "pong", // ping クエリは "pong" 文字列を返す
		todos: (): Todo[] => todos,
	},
	Mutation: {
		addTodo: (_: unknown, { text }: { text: string }) => {
			const newTodo: Todo = {
				id: nextTodoId.toString(),
				text,
				completed: false,
			};
			nextTodoId++; // IDをインクリメント
			todos.push(newTodo);

			return {
				success: true,
				message: "Todo added successfully",
				todo: newTodo,
			};
		},
		updateTodoStatus: (
			_: unknown,
			{ id, completed }: { id: string; completed: boolean },
		) => {
			const index = todos.findIndex((todo) => todo.id === id);
			if (index !== -1) {
				todos[index].completed = completed;
				return {
					success: true,
					message: "Todo updated successfully",
					todo: todos[index],
				};
			}
			return {
				success: false,
				message: "Todo not found",
				todo: null,
			};
		},
		deleteTodo: (_: unknown, { id }: { id: string }) => {
			const index = todos.findIndex((todo) => todo.id === id);
			if (index !== -1) {
				const deletedTodo = todos.splice(index, 1)[0];
				return {
					success: true,
					message: "Todo deleted successfully",
				};
			}
			return {
				success: false,
				message: "Todo not found",
				todo: null,
			};
		},
	},
};

// 3. GraphQL Yoga インスタンス作成
const yoga = createYoga({
	schema: createSchema({
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
const app = express();

// 5. 特定のパスで Yoga ミドルウェアを使用
// `/graphql` へのリクエストを Yoga が処理するように設定
app.use(yoga.graphqlEndpoint, yoga);

// (オプション) ルートパスへの簡単な応答
app.get("/", (req: Request, res: Response) => {
	res.send("GraphQL Server is running! Access GraphQL at /graphql");
});

// 6. Express サーバー起動
const port = process.env.PORT || 4000;
app.listen(port, () => {
	console.log(
		`🚀 GraphQL Server ready at http://localhost:${port}${yoga.graphqlEndpoint}`,
	);
});
