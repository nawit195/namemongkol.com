"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.solutionImages = void 0;
// Clean in-house solution photography (no baked-in text)
const solution_led_display_jpg_1 = __importDefault(require("@/assets/solution-led-display.jpg"));
const solution_interactive_display_jpg_1 = __importDefault(require("@/assets/solution-interactive-display.jpg"));
const solution_projector_jpg_1 = __importDefault(require("@/assets/solution-projector.jpg"));
const solution_wireless_presentation_jpg_1 = __importDefault(require("@/assets/solution-wireless-presentation.jpg"));
const solution_av_solutions_jpg_1 = __importDefault(require("@/assets/solution-av-solutions.jpg"));
exports.solutionImages = {
    "led-display": solution_led_display_jpg_1.default,
    "interactive-display": solution_interactive_display_jpg_1.default,
    projector: solution_projector_jpg_1.default,
    "wireless-presentation": solution_wireless_presentation_jpg_1.default,
    "av-solutions": solution_av_solutions_jpg_1.default,
};
