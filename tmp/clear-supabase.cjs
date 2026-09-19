#!/usr/bin/env node
"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return (
      (g.next = verb(0)),
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv = require("dotenv");
var pg_1 = require("pg");
dotenv.config();
var DATABASE_URL = process.argv[2] || process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error(
    "Missing DATABASE_URL. Set a Postgres connection string in the environment before running.",
  );
  process.exit(1);
}
function clearPublicSchema() {
  return __awaiter(this, void 0, void 0, function () {
    var client, res, tables, _i, tables_1, t, err_1;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          client = new pg_1.Client({ connectionString: DATABASE_URL });
          return [4 /*yield*/, client.connect()];
        case 1:
          _a.sent();
          _a.label = 2;
        case 2:
          _a.trys.push([2, 8, 9, 11]);
          return [
            4 /*yield*/,
            client.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public';"),
          ];
        case 3:
          res = _a.sent();
          tables = res.rows.map(function (r) {
            return r.tablename;
          });
          if (tables.length === 0) {
            console.log("No tables found in schema 'public'. Nothing to do.");
            return [2 /*return*/];
          }
          console.log("Found ".concat(tables.length, " table(s) in 'public':"), tables.join(", "));
          ((_i = 0), (tables_1 = tables));
          _a.label = 4;
        case 4:
          if (!(_i < tables_1.length)) return [3 /*break*/, 7];
          t = tables_1[_i];
          console.log("Dropping table ".concat(t, " ..."));
          return [4 /*yield*/, client.query('DROP TABLE IF EXISTS "'.concat(t, '" CASCADE;'))];
        case 5:
          _a.sent();
          _a.label = 6;
        case 6:
          _i++;
          return [3 /*break*/, 4];
        case 7:
          console.log("All tables in schema 'public' dropped successfully.");
          return [3 /*break*/, 11];
        case 8:
          err_1 = _a.sent();
          console.error("Error clearing public schema:", err_1);
          process.exitCode = 2;
          return [3 /*break*/, 11];
        case 9:
          return [4 /*yield*/, client.end()];
        case 10:
          _a.sent();
          return [7 /*endfinally*/];
        case 11:
          return [2 /*return*/];
      }
    });
  });
}
clearPublicSchema();
