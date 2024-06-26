const {
  Bot,
  GrammyError,
  HttpError,
  InlineKeyboard,
  InputFile,
  Keyboard,
} = require("grammy");
const { FindErrorCode } = require("./utils");
const fs = require("fs");
let isPdfCall = false;
let isRegister = false;
let isErrorFound = false;
require("dotenv").config();
const bot = new Bot('7297332378:AAGUrwnWnH5KhARdCNdOyZEOeQbF1YrvW9Y');
bot.command("registerzapros", async (ctx) => {
  let registeusers = fs.readFileSync("ZaprosToRegisterUsers.json");
  let Users = JSON.parse(registeusers);
  if (ctx.from.id == 1051796445) {
    for (let k of Users) {
      await ctx.reply(`${k.name}`, {
        reply_markup: new InlineKeyboard()
          .text("Да", JSON.stringify({ id: k.id, add: true }))
          .text("Нет", JSON.stringify({ id: k.id, add: false })),
      });
    }
    return;
  } else {
    await ctx.reply("Этот функционал доступен только администратору");
  }
  if (Users.length == 0) {
    await ctx.reply("Пусто");
    return;
  }
});

bot.command("start", async (ctx) => {
  let OptionsKeyboard;
  const users = JSON.parse(fs.readFileSync("Users.json"));
  if (users.find(({ id }) => id == ctx.from.id)) {
    OptionsKeyboard = new Keyboard()
      .text("База знаний")
      .row()
      .text("Код ошибки")
      .row()
      .resized();
    await ctx.reply("Главное меню", { reply_markup: OptionsKeyboard });
  } else {
    OptionsKeyboard = new Keyboard().text("Регистрация").row().resized();
    await ctx.reply("Зарегистрируйтесь,чтобы получить доступ к боту", {
      reply_markup: OptionsKeyboard,
    });
  }
});
bot.hears("База знаний", async (ctx) => {
  isErrorFound = false;
  isRegister = false;
  let OptionsKeyboard = new Keyboard()
    .text("В главное меню")
    .row()
    .text("Инструкции от банков")
    .resized()
    .text("Устройства")
    .row()
    .text("Базовые инструкции ")
    .resized()
    .text("Проектные работы")
    .row()
    .row();
  await ctx.reply("Меню", {
    reply_markup: OptionsKeyboard,
  });
});
bot.hears("Инструкции от банков", async (ctx) => {
  let OptionsKeyboard = new Keyboard()
    .text("В главное меню")
    .row()
    .text("Сбербанк")
    .resized()
    .text("ВТБ")
    .row()
    .text("Райфайзен")
    .resized()
    .text("Альфа")
    .row()
    .text("Зенит Банк")
    .resized()
    .text("Совкомбанк")
    .row()
    .text("Тинькофф")
    .resized()
    .text("Магнит КСО")
    .row()
    .text("Открытие")
    .resized()
    .text("Газпромбанк")
    .row();
  await ctx.reply("Выберите банк", {
    reply_markup: OptionsKeyboard,
  });
});
bot.hears("В главное меню", async (ctx) => {
  let OptionsKeyboard = new Keyboard()
    .text("База знаний")
    .row()
    .text("Код ошибки")
    .row()
    .resized();
  await ctx.reply("Главное меню", {
    reply_markup: OptionsKeyboard,
  });
});
bot.hears("Устройства", async (ctx) => {
  let OptionsKeyboard = new Keyboard()
    .text("В главное меню")
    .row()
    .text("MX 8600")
    .resized()
    .text("MX8600S")
    .row()
    .text("MX8600SB 19/32")
    .resized()
    .text("MX8600ST")
    .row()
    .text("TCR")
    .resized()
    .text("MX9100SB")
    .row()
    .resized();
  await ctx.reply("Выберите устройство", {
    reply_markup: OptionsKeyboard,
  });
});
bot.hears("Регистрация", async (ctx) => {
  isErrorFound = false;
  isPdfCall = false;
  await ctx.reply("Введите ваше ФИО");
  isRegister = true;
});
bot.hears("Код ошибки", async (ctx) => {
  isPdfCall = false;
  isRegister = false;
  await ctx.reply("Введите код ошибки");
  isErrorFound = true;
});
bot.on("callback_query:data", async (ctx) => {
  const users = JSON.parse(fs.readFileSync("ZaprosToRegisterUsers.json"));
  let infoaboutusers = JSON.parse(ctx.update.callback_query.data);
  if (infoaboutusers.add) {
    const users = JSON.parse(fs.readFileSync("Users.json"));
    if (users.find(({ id }) => id === infoaboutusers.id)) {
    } else {
      users.push({ id: infoaboutusers.id });
      fs.writeFileSync("Users.json", JSON.stringify(users));
      const filteredusers = JSON.stringify(
        users.filter((item) => item.id !== infoaboutusers.id)
      );
      fs.writeFileSync("ZaprosToRegisterUsers.json", filteredusers);
      await ctx.answerCallbackQuery();

      await ctx.reply(
        `Пользователь ${infoaboutusers.id} успешно зарегистрирован`
      );
      return;
    }
  } else {
    const filteredusers = JSON.stringify(
      users.filter((item) => item.id !== infoaboutusers.id)
    );
    fs.writeFileSync("ZaprosToRegisterUsers.json", filteredusers);
    await ctx.reply(`Заявка пользователя -${infoaboutusers.id} была отклонена`);
  }
});
bot.on("message", async (ctx) => {
  if (isPdfCall) {
    await ctx.replyWithDocument(new InputFile("./tests.pdf"));
    ctx.answerCallbackQuery();
    isPdfCall = false;
    return;
  }
  if (isRegister) {
    let rawdata = JSON.parse(fs.readFileSync("ZaprosToRegisterUsers.json"));
    let RegisterUsers = JSON.parse(fs.readFileSync("Users.json"));
    for (let k of rawdata) {
      if (k.id === ctx.from.id) {
        await ctx.reply("Такой пользователь уже ожидает регистрации ");
      }
    }
    for (let k of RegisterUsers) {
      if (k.id == ctx.from.id) {
        await ctx.reply("Такой пользователь уже зарегистрирован");
        return;
      }
    }
    rawdata.push({
      name: ctx.update.message.text.replace(/ +/g, " "),
      id: ctx.from.id,
    });
    let data = JSON.stringify(rawdata);
    fs.writeFileSync("ZaprosToRegisterUsers.json", data);
    await ctx.reply("Вас внесли в список на авторизацию.");

    ctx.answerCallbackQuery();
    return;
  }
  if (isErrorFound) {
    const Error = FindErrorCode(ctx.update.message.text.toUpperCase());
    if (Error) {
      if (Error.isCritical) {
        await ctx.reply(
          `<b>Обратите внимание,эта критическая ошибка!'⚠️'</b> 
Описание ошибки-${Error.ErrorDescription} `,
          {
            parse_mode: "HTML",
          }
        );
        await ctx.reply(`Как исправить-${Error.HowToFixError}`);
      } else {
        await ctx.reply(`${Error.ErrorDescription}`);
        await ctx.reply(`Как исправить-${Error.HowToFixError}`);
      }
    } else {
      await ctx.reply(
        "Такого кода нет,проверьте правильность кода и попробуйте еще раз"
      );
    }
    ctx.answerCallbackQuery();
    return;
  }
});

bot.api.setMyCommands([
  { command: "registerzapros", description: "Запросы на регистрацию" },
  { command: "start", description: "Старт " },
]);
bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error("Error in request:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Could not contact Telegram:", e);
  } else {
    console.error("Unknown error:", e);
  }
});

bot.start();
