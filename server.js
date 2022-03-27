const http = require('http');
const Koa = require('koa');
const Router = require('koa-router');
const WS = require('ws');
const koaBody = require('koa-body');
const cors = require('@koa/cors');
const uniqid = require('uniqid');

const app = new Koa();
const users = [];

app.use(koaBody({
  urlencoded: true,
  multipart: true,
  json: true,
}));

app.use(
  cors({
    origin: '*',
    credentials: true,
    'Access-Control-Allow-Origin': true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  })
)

const router = new Router();

router.get('/users', async (ctx) => {
  ctx.response.body = users;
  ctx.response.status = 200;
});

router.post('/users', async (ctx, next) => {
  if (users.find((element) => element.name === ctx.request.body)) {
    ctx.response.body = { message: `Пользователь с именем ${ctx.request.body} уже существует, попробуйте другое имя` };
    ctx.response.status = 230;
  }
  else {
    const id = uniqid();
    users.push({ name: ctx.request.body, id: id });
    ctx.response.body = {
      message: `Welcome to chat, ${ctx.request.body}`,
      id: id
    }
  }
});

router.delete('/users:id', async (ctx, next) => {
  const index = users.findIndex((element) => element.id == ctx.params.id);
  console.log(ctx.params.id);
  if (index !== -1) {
    users.splice(index, 1);
    ctx.response.status = 204;
    ctx.response.body = `User successfully deleted`;
  }
  else {
    ctx.response.status = 404;
    ctx.response.body = 'This user doesn\'t exixt';
  }
});

app.use(router.routes()).use(router.allowedMethods());

const port = process.env.PORT || 7070;
const server = http.createServer(app.callback())
const wsServer = new WS.Server({ server });

wsServer.on('connection', (ws, req) => {
  ws.on('message', msg => {
    const message = msg.toString('utf-8');
  [...wsServer.clients]
    .filter(o => o.readyState === WS.OPEN)
    .forEach(o => o.send(message));
});
  ws.send('welcome');
});

server.listen(port);
