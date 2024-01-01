import express from "express";
import fs from "node:fs";
import { PrismaClient } from "@prisma/client";

const app = express();
app.use(express.urlencoded({ extended: true }));
const prisma = new PrismaClient();

const template = fs.readFileSync("./template.html", "utf-8");
app.get("/", async (request, response) => {
  const todos = await prisma.todo.findMany();
  response.send(
    template.replace(
      "<!-- todos -->",
      todos
        .map(
          (todo) => `
            <li>
              <span>${todo.title}</span>
              <form method="post" action="/delete">
                <input type="hidden" name="id" value="${todo.id}" />
                <button type="submit">削除</button>
              </form>
            </li>
          `
        )
        .join("")
    )
  );
});

app.post("/create", async (request, response) => {
  await prisma.todo.create({
    data: { title: request.body.title },
  });
  response.redirect("/");
});

app.post("/delete", async (request, response) => {
  await prisma.todo.delete({
    where: { id: parseInt(request.body.id, 10) },
  });
  response.redirect("/");
});

app.listen(3000);
