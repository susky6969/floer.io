import { Game } from "@/scripts/game.ts";

export async function setupUI(game: Game): Promise<void> {
    const { uiManager: { ui } } = game;

    ui.ready_button.on("click", (e: Event) => {
        console.log("clicked");
        ui.canvas.css("display", "block");
        ui.out_game_screen.css("display", "none");

        game.startGame();
    });
}
