import editor from "@monaco-editor/react";

return (
    <Editor
        options={{
            fontSize: fontSize,
            padding: { top: 16, bottom: 16 }
        }}
        height="calc(100% - 48px)"
        width="100%"
        theme={userTheme}
        language={userLang.value}
        value={userCode}
        onChange={(value) => setUserCode(value)}
    />
)