import { useRef, useState, useMemo, type RefObject } from "react";
import { ScrollBoxRenderable } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { getFilteredCommands } from "./filter-commands";
import type { Command } from "./types";

// return type of this hook
type useCommandMenuReturn = {
    showCommandMenu: boolean;
    commandQuery: string;
    selectedIndex: number;
    scrollRef: RefObject<ScrollBoxRenderable | null>;
    handleContentChange: (text: string) => void;
    resolveCommand: (index: number) => Command | undefined | void;
    setSelectedIndex: (index: number) => void;
};

export function useCommandMenu(): useCommandMenuReturn {
    const [textValue, setTextValue] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [showCommandMenu, setShowCommandMenu] = useState(false);
    const scrollRef = useRef<ScrollBoxRenderable>(null);

    const commandQuery = showCommandMenu && textValue.startsWith("/") ? textValue.slice(1) : "";

    const filteredCommands = useMemo(() => getFilteredCommands(commandQuery), [commandQuery]);  // list of commands user is searching fro

    const handleContentChange = (text: string) => {
        setTextValue(text);
        setSelectedIndex(0);

        // jump back to the top of the list when the user types a new character
        const scrollbox = scrollRef.current;
        if (scrollbox) {
            scrollbox.scrollTo(0);
        }

        const prefix = text.startsWith("/") ? text.slice(1) : null;
        if (prefix !== null && !prefix.includes(" ")) {
            setShowCommandMenu(true);
        } else {
            setShowCommandMenu(false);   // whitesace after / means the user just means a forwad slash not looking for any command
        }
    };

    // Resolve the command at a specific index (returns the command, caller handles execution)
    const resolveCommand = (index: number): Command | undefined => {
        const command = filteredCommands[index];
        if (command) {
            setShowCommandMenu(false);    // close the menu if a command is selected
        }
        return command;
    };

    // Arrow keys move selection in the menu
    useKeyboard((key) => {
        if (!showCommandMenu) return;

        if (key.name === "escape") {
            key.preventDefault();
            setShowCommandMenu(false);
        }

        // actual navigation stuff
        if (key.name === "up") {
            key.preventDefault();
            setSelectedIndex((i: number) => {
                const newIndex = Math.max(0, i - 1);
                // keep the highlighted item visible when arrowing past the edge
                const sb = scrollRef.current;
                if (sb && newIndex < sb.scrollTop) {
                    sb.scrollTo(newIndex);
                }

                return newIndex;
            });
        } else if (key.name === "down") {
            key.preventDefault();
            setSelectedIndex((i: number) => {
                if (filteredCommands.length === 0) {
                    return 0;
                }

                const newIndex = Math.min(filteredCommands.length - 1, i + 1);
                const sb = scrollRef.current;
                if (sb) {
                    const viewportHeight = sb.viewport.height;
                    const visibleEnd = sb.scrollTop + viewportHeight - 1;
                    if (newIndex > visibleEnd) {
                        sb.scrollTo(newIndex - viewportHeight + 1);
                    }
                }
                return newIndex;
            });
        }
    });

    return {
        showCommandMenu,
        commandQuery,
        selectedIndex,
        scrollRef,
        handleContentChange,
        resolveCommand,
        setSelectedIndex
    };
};