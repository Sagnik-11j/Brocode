import type { RefObject } from "react";
import { TextAttributes, type ScrollBoxRenderable } from "@opentui/core";
import { getFilteredCommands } from "./filter-commands";
import { COMMANDS } from "./commands";

const MAX_VISIBLE_ITEMS = 8;

// command column width: so that all command descriptions appear in a clear tabluar format
const COMMAND_COL_WIDTH = Math.max(...COMMANDS.map((cmd) => cmd.name.length)) + 4;

type CommandMenuProps = {
    query: string;
    selectedIndex: number;
    scrollRef: RefObject<ScrollBoxRenderable | null>;
    onSelect: (index: number) => void;
    onExecute: (index: number) => void;
};


export const CommandMenu = ({ query, selectedIndex, scrollRef, onExecute, onSelect }: CommandMenuProps) => {
    const filtered = getFilteredCommands(query);   // what commands should be rendered
    const visibleHeight = Math.min(filtered.length, MAX_VISIBLE_ITEMS);   // how many should be visible at any instant 

    if (filtered.length === 0) {
        return (
            <box paddingX={1}>
                <text attributes={TextAttributes.DIM}>
                    No matching commands
                </text>
            </box>
        )
    }

    return (
        <scrollbox ref={scrollRef} height={visibleHeight}>
            {filtered.map((cmd, i) => {
                const isSelected = i === selectedIndex;

                return (
                    <box
                        key={cmd.value}
                        flexDirection="row"
                        paddingX={1}
                        height={1}
                        overflow="hidden"
                        backgroundColor={isSelected ? "#ff8b1f" : undefined}
                        onMouseMove={() => onSelect(i)}
                        onMouseDown={() => onExecute(i)} 
                    >
                        {/* command */}
                        <box width={COMMAND_COL_WIDTH} flexShrink={0}>
                            <text selectable={false} fg={isSelected ? "black" : "white"}>
                                /{cmd.name}
                            </text>
                        </box>
                        {/* command description */}
                        <box flexGrow={1} flexShrink={1} overflow="hidden">
                            <text selectable={false} fg={isSelected ? "black" : "gray"}>
                                {cmd.description}
                            </text>
                        </box>
                    </box>
                )
            })}
        </scrollbox>
    )
}

