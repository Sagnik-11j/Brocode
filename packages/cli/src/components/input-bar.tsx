import { useRef, useCallback, useEffect } from "react";
import type { TextareaRenderable } from "@opentui/core";
import { useRenderer } from "@opentui/react";
import StatusBar from "./status-bar";
import { EmptyBorder } from "./border";
import type { KeyBinding } from "@opentui/core";
import { CommandMenu } from "./command-menu";
import type { Command } from "./command-menu/types";
import { useCommandMenu } from "./command-menu/use-command-menu";

type Props = {
    onSubmit: (text: string) => void;
    disabled?: boolean;
};

export const TEXT_AREA_KEYBINDINGS: KeyBinding[] = [
    { name: "return", action: "submit" },
    { name: "enter", action: "submit" },
    { name: "return", shift: true, action: "newline" },
    { name: "enter", shift: true, action: "newline" },
];

const InputBar = ({ onSubmit, disabled }: Props) => {
    const textareaRef = useRef<TextareaRenderable>(null);
    const onSubmitRef = useRef<() => void>(() => { });
    const renderer = useRenderer();

    const {
        showCommandMenu,
        commandQuery,
        selectedIndex,
        scrollRef,
        handleContentChange,
        resolveCommand,
        setSelectedIndex,
    } = useCommandMenu();

    const handleCommandExecute = useCallback((index: number) => {
        const command = resolveCommand(index);   // finding the command

        handleCommand(command);
    }, [])


    const handleTextareaContentChange = useCallback(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        handleContentChange(textarea.plainText);
    }, []);


    const handleCommand = useCallback((command: Command | undefined | void) => {
        const textarea = textareaRef.current;
        if (!textarea || !command) return;

        textarea.setText("");

        if (command.action) {
            command.action({
                exit: () => renderer.destroy(),
            });
        } else {
            textarea.insertText(command.value + " ");
        }
    }, [renderer]);

    const handleSubmit = useCallback(() => {
        if (disabled) return;

        const textarea = textareaRef.current;
        if (!textarea) return;

        const text = textarea.plainText.trim();
        if (text.length === 0) return;

        onSubmit(text);
        textarea.setText("");
    }, [disabled, onSubmit])


    // wire up textarea submit handler once so it always reads the latest state
    useEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        textarea.onSubmit = () => {
            onSubmitRef.current();
        };
    }, []);

    // update the onSubmitRef on every render
    onSubmitRef.current = () => {
        if (disabled) return;

        if (showCommandMenu) {
            const command = resolveCommand(selectedIndex);
            handleCommand(command);
            return;
        }

        handleSubmit();
    }


    return (
        <box width={"100%"} alignItems="center">
            <box
                border={["left"]}
                borderColor={"#f96400"}
                customBorderChars={{
                    ...EmptyBorder,
                    vertical: "┃",
                    bottomLeft: "╹",
                }}
                width={"100%"}
            >
                <box
                    position="relative"
                    justifyContent="center"
                    paddingX={2}
                    paddingY={1}
                    backgroundColor={"#1A1A24"}
                    width={"100%"}
                    gap={1}
                >
                    {/* command menu rendered here */}
                    {showCommandMenu && (
                        <box
                            position="absolute"
                            bottom={"100%"}
                            left={0}
                            width={"100%"}
                            backgroundColor={"#1a1a24"}
                            zIndex={10}
                        >
                            <CommandMenu
                                query={commandQuery}
                                selectedIndex={selectedIndex}
                                onExecute={handleCommandExecute}
                                onSelect={setSelectedIndex}
                                scrollRef={scrollRef}
                            />
                        </box>
                    )}
                    <textarea
                        ref={textareaRef}
                        focused={!disabled}
                        placeholder={`Ask anything... "Fix a bug in the database"`}
                        keyBindings={TEXT_AREA_KEYBINDINGS}
                        onContentChange={handleTextareaContentChange}
                    />
                    <StatusBar />
                </box>
            </box>
        </box>
    )
}

export default InputBar
