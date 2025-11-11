"use client";

import React, { useRef, useEffect, useState } from "react";

export default function RichTextEditor({ setText, text }) {
  const descriptionEditorRef = useRef(null);
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    insertOrderedList: false,
    insertUnorderedList: false,
  });

  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    descriptionEditorRef.current?.focus();
    updateActiveFormats();
  };

  const updateActiveFormats = () => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    let element = range.commonAncestorContainer;

    // If it's a text node, get the parent element
    if (element.nodeType === Node.TEXT_NODE) {
      element = element.parentElement;
    }

    // Check each format
    const formats = {
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      strikeThrough: document.queryCommandState("strikeThrough"),
      insertOrderedList: document.queryCommandState("insertOrderedList"),
      insertUnorderedList: document.queryCommandState("insertUnorderedList"),
    };

    setActiveFormats(formats);
  };

  const handleDescriptionChange = () => {
    if (descriptionEditorRef.current) {
      setText(descriptionEditorRef.current.innerHTML);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();

    // Get plain text from clipboard
    const text = e.clipboardData.getData("text/plain");

    // Insert the plain text at cursor position
    document.execCommand("insertText", false, text);

    // Update the state
    handleDescriptionChange();
  };

  // Handle placeholder for contenteditable div
  useEffect(() => {
    const editor = descriptionEditorRef.current;
    if (editor) {
      const handleFocus = () => {
        if (editor.innerHTML === "" || editor.innerHTML === "<br>") {
          editor.innerHTML = "";
        }
      };

      const handleBlur = () => {
        if (editor.innerHTML === "" || editor.innerHTML === "<br>") {
          editor.innerHTML = "";
        }
      };

      editor.addEventListener("focus", handleFocus);
      editor.addEventListener("blur", handleBlur);

      return () => {
        editor.removeEventListener("focus", handleFocus);
        editor.removeEventListener("blur", handleBlur);
      };
    }
  }, []);

  // Update editor content when text prop changes (e.g., when loading saved draft)
  useEffect(() => {
    if (descriptionEditorRef.current && text) {
      // Only update if the current content doesn't match the text prop
      // This prevents overwriting user input while they're typing
      if (descriptionEditorRef.current.innerHTML !== text) {
        descriptionEditorRef.current.innerHTML = text;
      }
    }
  }, [text]);

  // Add selection change listener to update active formats
  useEffect(() => {
    const handleSelectionChange = () => {
      updateActiveFormats();
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, []);

  return (
    <>
      <div
        ref={descriptionEditorRef}
        contentEditable={true}
        className="form-control"
        style={{
          height: "300px",
          overflowY: "auto",
          borderTopLeftRadius: "0",
          borderTopRightRadius: "0",
          padding: "12px",
          lineHeight: "1.5",
          position: "relative",
        }}
        onInput={handleDescriptionChange}
        onBlur={handleDescriptionChange}
        onPaste={handlePaste}
        data-placeholder="Enter description"
      ></div>
      {/* Rich Text Editor Toolbar */}
      <div
        style={{
          border: "1px solid #E9EAEB",
          borderRadius: "0 0 4px 4px",
          backgroundColor: "#FFFFFF",
          display: "flex",
          gap: "4px",
          flexWrap: "wrap",
          height: "48px",
        }}
      >
        <button
          type="button"
          className={`btn btn-sm ${activeFormats.bold ? "btn-primary" : "btn-outline-secondary"}`}
          onClick={() => formatText("bold")}
          title="Bold"
          style={{
            padding: "4px 8px",
            fontSize: 20,
            color: activeFormats.bold ? "#FFFFFF" : "#535862",
            backgroundColor: activeFormats.bold ? "#DEDEDE" : "transparent",
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 12 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0.9375 0.046875H6.25C6.95133 0.0471267 7.63804 0.246721 8.23047 0.62207C8.82296 0.997533 9.29697 1.53378 9.59668 2.16797C9.8963 2.80204 10.0098 3.50809 9.92383 4.2041C9.83778 4.90022 9.55545 5.55751 9.11035 6.09961L9.0752 6.14355L9.12402 6.1709C9.90403 6.60084 10.5189 7.27805 10.8721 8.0957C11.2251 8.91329 11.297 9.82499 11.0752 10.6875C10.8534 11.55 10.3511 12.3145 9.64746 12.8604C8.94374 13.4063 8.07814 13.7027 7.1875 13.7031H0.9375C0.701292 13.7031 0.474642 13.6094 0.307617 13.4424C0.140593 13.2754 0.046875 13.0487 0.046875 12.8125V0.9375C0.046875 0.701292 0.140593 0.474642 0.307617 0.307617C0.474642 0.140593 0.701292 0.046875 0.9375 0.046875ZM1.82812 11.9219H7.1875C7.78009 11.9219 8.34855 11.6866 8.76758 11.2676C9.1866 10.8486 9.42188 10.2801 9.42188 9.6875C9.42188 9.09491 9.1866 8.52645 8.76758 8.10742C8.34855 7.6884 7.78009 7.45312 7.1875 7.45312H1.82812V11.9219ZM1.82812 5.67188H6.25C6.75971 5.67188 7.24895 5.4698 7.60938 5.10938C7.9698 4.74895 8.17188 4.25971 8.17188 3.75C8.17188 3.24029 7.9698 2.75105 7.60938 2.39062C7.24895 2.0302 6.75971 1.82812 6.25 1.82812H1.82812V5.67188Z"
              fill={activeFormats.bold ? "#FFFFFF" : "#535862"}
              stroke={activeFormats.bold ? "#FFFFFF" : "#535862"}
              stroke-width="0.09375"
            />
          </svg>
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeFormats.italic ? "btn-primary" : "btn-outline-secondary"}`}
          onClick={() => formatText("italic")}
          title="Italic"
          style={{
            padding: "4px 8px",
            fontSize: 20,
            color: activeFormats.italic ? "#FFFFFF" : "#535862",
            backgroundColor: activeFormats.italic ? "#DFDFDF" : "transparent",
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 12 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4.6875 0.046875H10.9375C11.1737 0.046875 11.4004 0.140593 11.5674 0.307617C11.7344 0.474642 11.8281 0.701292 11.8281 0.9375C11.8281 1.17371 11.7344 1.40036 11.5674 1.56738C11.4004 1.73441 11.1737 1.82812 10.9375 1.82812H8.4541L5.29785 11.2969H7.1875C7.42371 11.2969 7.65036 11.3906 7.81738 11.5576C7.98441 11.7246 8.07812 11.9513 8.07812 12.1875C8.07812 12.4237 7.98441 12.6504 7.81738 12.8174C7.65036 12.9844 7.42371 13.0781 7.1875 13.0781H0.9375C0.701292 13.0781 0.474642 12.9844 0.307617 12.8174C0.140593 12.6504 0.046875 12.4237 0.046875 12.1875C0.046875 11.9513 0.140593 11.7246 0.307617 11.5576C0.474642 11.3906 0.701292 11.2969 0.9375 11.2969H3.4209L6.57715 1.82812H4.6875C4.45129 1.82812 4.22464 1.73441 4.05762 1.56738C3.89059 1.40036 3.79688 1.17371 3.79688 0.9375C3.79688 0.701292 3.89059 0.474642 4.05762 0.307617C4.22464 0.140593 4.45129 0.046875 4.6875 0.046875Z"
              fill={activeFormats.italic ? "#FFFFFF" : "#535862"}
              stroke={activeFormats.italic ? "#FFFFFF" : "#535862"}
              stroke-width="0.09375"
            />
          </svg>
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeFormats.underline ? "btn-primary" : "btn-outline-secondary"}`}
          onClick={() => formatText("underline")}
          title="Underline"
          style={{
            padding: "4px 8px",
            fontSize: 20,
            color: activeFormats.underline ? "#FFFFFF" : "#535862",
            backgroundColor: activeFormats.underline
              ? "#007bff"
              : "transparent",
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 12 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0.9375 13.1719H10.9375C11.1737 13.1719 11.4004 13.2656 11.5674 13.4326C11.7344 13.5996 11.8281 13.8263 11.8281 14.0625C11.8281 14.2987 11.7344 14.5254 11.5674 14.6924C11.4004 14.8594 11.1737 14.9531 10.9375 14.9531H0.9375C0.701292 14.9531 0.474642 14.8594 0.307617 14.6924C0.140593 14.5254 0.046875 14.2987 0.046875 14.0625C0.046875 13.8263 0.140593 13.5996 0.307617 13.4326C0.474642 13.2656 0.701292 13.1719 0.9375 13.1719ZM10.3125 0.046875C10.5487 0.046875 10.7754 0.140593 10.9424 0.307617C11.1094 0.474642 11.2031 0.701292 11.2031 0.9375V6.5625L11.1963 6.82324C11.1305 8.12435 10.5847 9.35863 9.65918 10.2842C8.672 11.2714 7.33359 11.8267 5.9375 11.8281L5.67676 11.8213C4.37565 11.7555 3.14137 11.2097 2.21582 10.2842C1.22864 9.297 0.673323 7.95859 0.671875 6.5625V0.9375C0.671875 0.701292 0.765593 0.474642 0.932617 0.307617C1.09964 0.140593 1.32629 0.046875 1.5625 0.046875C1.79871 0.046875 2.02536 0.140593 2.19238 0.307617C2.35941 0.474642 2.45312 0.701292 2.45312 0.9375V6.5625C2.45312 7.48661 2.82019 8.37292 3.47363 9.02637C4.12708 9.67981 5.01339 10.0469 5.9375 10.0469C6.86161 10.0469 7.74792 9.67982 8.40137 9.02637C9.05482 8.37292 9.42188 7.48661 9.42188 6.5625V0.9375C9.42188 0.701292 9.51559 0.474642 9.68262 0.307617C9.84964 0.140593 10.0763 0.046875 10.3125 0.046875Z"
              fill={activeFormats.underline ? "#FFFFFF" : "#535862"}
              stroke={activeFormats.underline ? "#FFFFFF" : "#535862"}
              stroke-width="0.09375"
            />
          </svg>
        </button>
        {/* Strikethrough */}
        <button
          type="button"
          className={`btn btn-sm ${activeFormats.strikeThrough ? "btn-primary" : "btn-outline-secondary"}`}
          onClick={() => formatText("strikeThrough")}
          title="Strikethrough"
          style={{
            padding: "4px 8px",
            fontSize: 20,
            color: activeFormats.strikeThrough ? "#FFFFFF" : "#535862",
            backgroundColor: activeFormats.strikeThrough
              ? "#007bff"
              : "transparent",
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 16 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0.9375 6.29688H14.6875C14.9237 6.29688 15.1504 6.39059 15.3174 6.55762C15.4844 6.72464 15.5781 6.95129 15.5781 7.1875C15.5781 7.42371 15.4844 7.65036 15.3174 7.81738C15.1504 7.98441 14.9237 8.07812 14.6875 8.07812H12.2305L12.2979 8.15527C12.816 8.75247 13.0937 9.52106 13.0781 10.3115V10.3125C13.0781 11.4237 12.4777 12.4941 11.4238 13.2471C10.4508 13.9438 9.16655 14.3281 7.8125 14.3281C6.45845 14.3281 5.17422 13.9438 4.20117 13.2471C3.1473 12.4941 2.54688 11.4237 2.54688 10.3125C2.54688 10.0763 2.64059 9.84964 2.80762 9.68262C2.97464 9.51559 3.20129 9.42188 3.4375 9.42188C3.67371 9.42188 3.90036 9.51559 4.06738 9.68262C4.23441 9.84964 4.32812 10.0763 4.32812 10.3125C4.32812 10.9276 4.73624 11.4873 5.37012 11.8906C6.00491 12.2945 6.87309 12.5469 7.8125 12.5469C8.75191 12.5469 9.62009 12.2945 10.2549 11.8906C10.8888 11.4873 11.2969 10.9276 11.2969 10.3125C11.2969 9.7994 11.1081 9.39167 10.6611 9.03711C10.2177 8.68546 9.52013 8.38574 8.50195 8.08008L8.48828 8.125L8.50195 8.07812H0.9375C0.701292 8.07812 0.474642 7.98441 0.307617 7.81738C0.140593 7.65036 0.046875 7.42371 0.046875 7.1875C0.046875 6.95129 0.140593 6.72464 0.307617 6.55762C0.474642 6.39059 0.701292 6.29688 0.9375 6.29688ZM7.8125 0.046875C9.72296 0.046875 11.3285 0.817518 12.1797 2.11621L12.3398 2.38379C12.4393 2.58873 12.4564 2.82376 12.3877 3.04102C12.3187 3.25896 12.169 3.44243 11.9688 3.55273C11.7684 3.66302 11.5327 3.6921 11.3115 3.63379C11.0905 3.57543 10.9001 3.43392 10.7803 3.23926C10.2911 2.35079 9.17753 1.82812 7.8125 1.82812C6.8945 1.82812 6.08607 2.06407 5.50586 2.46094C4.92529 2.85811 4.57129 3.41852 4.57129 4.0625C4.57129 4.29866 4.47751 4.52537 4.31055 4.69238C4.14357 4.85936 3.9168 4.95307 3.68066 4.95312C3.4445 4.95312 3.2178 4.85935 3.05078 4.69238C2.88376 4.52536 2.79004 4.29871 2.79004 4.0625C2.79004 1.78114 4.93754 0.046875 7.8125 0.046875Z"
              fill={activeFormats.strikeThrough ? "#FFFFFF" : "#535862"}
              stroke={activeFormats.strikeThrough ? "#FFFFFF" : "#535862"}
              stroke-width="0.09375"
            />
          </svg>
        </button>

        <div
          style={{ width: "1px", backgroundColor: "#D5D7DA", margin: "0 4px" }}
        ></div>
        <button
          type="button"
          className={`btn btn-sm ${activeFormats.insertOrderedList ? "btn-primary" : "btn-outline-secondary"}`}
          onClick={() => formatText("insertOrderedList")}
          title="Numbered List"
          style={{
            padding: "4px 8px",
            fontSize: 20,
            color: activeFormats.insertOrderedList ? "#FFFFFF" : "#535862",
            backgroundColor: activeFormats.insertOrderedList
              ? "#007bff"
              : "transparent",
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 16 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1.85156 8.19434C2.41644 8.11663 2.9897 8.26076 3.45117 8.5957C3.68235 8.76301 3.87737 8.97517 4.02441 9.21973C4.17153 9.46443 4.26734 9.73672 4.30664 10.0195C4.34679 10.2979 4.33131 10.5815 4.25977 10.8535C4.18824 11.1254 4.06245 11.38 3.89062 11.6025V11.6035L2.77441 13.0967L2.71875 13.1709H3.4375C3.67355 13.171 3.89948 13.2657 4.06641 13.4326C4.23332 13.5995 4.328 13.8255 4.32812 14.0615C4.32812 14.2977 4.23343 14.5244 4.06641 14.6914C3.89948 14.8583 3.67354 14.952 3.4375 14.9521H0.9375C0.772308 14.9521 0.610271 14.9061 0.469727 14.8193C0.329211 14.7325 0.215611 14.6086 0.141602 14.4609C0.0676014 14.3132 0.0361953 14.1479 0.0507812 13.9834C0.0653693 13.8189 0.12489 13.6616 0.223633 13.5293L2.46387 10.5322L2.47363 10.5195C2.50148 10.4847 2.52321 10.4453 2.53516 10.4023C2.54119 10.3806 2.54439 10.3583 2.5459 10.3359L2.54395 10.2686L2.52637 10.2002C2.51827 10.1778 2.50771 10.1561 2.49512 10.1357C2.47009 10.0954 2.43652 10.0602 2.39746 10.0332C2.3112 9.97098 2.20421 9.94371 2.09863 9.95703C1.99257 9.97051 1.89524 10.024 1.82715 10.1064V10.1074C1.81634 10.1211 1.80655 10.1354 1.79785 10.1504L1.77441 10.1973C1.69148 10.4163 1.52543 10.5948 1.3125 10.6924C1.09965 10.7899 0.856708 10.7998 0.636719 10.7197C0.416618 10.6396 0.237041 10.4753 0.136719 10.2637C0.0489566 10.0784 0.0281131 9.86938 0.0761719 9.67188L0.100586 9.58887C0.157217 9.43329 0.232294 9.28535 0.323242 9.14746L0.418945 9.0127C0.77275 8.56534 1.28654 8.27218 1.85156 8.19434ZM6.875 11.9209H14.6875C14.9235 11.921 15.1495 12.0157 15.3164 12.1826C15.4833 12.3495 15.578 12.5755 15.5781 12.8115C15.5781 13.0477 15.4834 13.2744 15.3164 13.4414C15.1495 13.6083 14.9235 13.702 14.6875 13.7021H6.875C6.63879 13.7021 6.41214 13.6084 6.24512 13.4414C6.07812 13.2744 5.98438 13.0477 5.98438 12.8115C5.9845 12.5755 6.07824 12.3495 6.24512 12.1826C6.41214 12.0156 6.63879 11.9209 6.875 11.9209ZM6.875 6.9209H14.6875C14.9235 6.921 15.1495 7.01571 15.3164 7.18262C15.4833 7.34953 15.578 7.57549 15.5781 7.81152C15.5781 8.04773 15.4834 8.27438 15.3164 8.44141C15.1495 8.6083 14.9235 8.70205 14.6875 8.70215H6.875C6.63879 8.70215 6.41214 8.60843 6.24512 8.44141C6.07812 8.27439 5.98438 8.04771 5.98438 7.81152C5.9845 7.57551 6.07824 7.34952 6.24512 7.18262C6.41214 7.01559 6.63879 6.9209 6.875 6.9209ZM2.22754 0.0478516C2.37901 0.0547343 2.52628 0.0999987 2.65527 0.179688C2.78434 0.25946 2.89093 0.371403 2.96484 0.503906C3.02026 0.603307 3.05592 0.712022 3.07031 0.824219L3.07812 0.9375V5.93652C3.07812 6.17273 2.98343 6.39938 2.81641 6.56641C2.64948 6.7333 2.42354 6.82705 2.1875 6.82715C1.95129 6.82715 1.72464 6.73343 1.55762 6.56641C1.39062 6.39939 1.29688 6.17271 1.29688 5.93652V2.37793L1.23535 2.39746C1.02357 2.46643 0.793573 2.45353 0.59082 2.36133C0.388059 2.26911 0.226853 2.10438 0.139648 1.89941C0.0526277 1.69467 0.0451781 1.4647 0.119141 1.25488C0.193101 1.04542 0.342311 0.86951 0.538086 0.764648L0.539062 0.765625L1.78906 0.140625C1.92481 0.0728538 2.07597 0.0409825 2.22754 0.0478516ZM6.875 1.9209H14.6875C14.9235 1.921 15.1495 2.01571 15.3164 2.18262C15.4833 2.34953 15.578 2.57549 15.5781 2.81152C15.5781 3.04773 15.4834 3.27438 15.3164 3.44141C15.1495 3.6083 14.9235 3.70205 14.6875 3.70215H6.875C6.63879 3.70215 6.41214 3.60843 6.24512 3.44141C6.07812 3.27439 5.98438 3.04771 5.98438 2.81152C5.9845 2.57551 6.07824 2.34952 6.24512 2.18262C6.41214 2.01559 6.63879 1.9209 6.875 1.9209Z"
              fill={activeFormats.insertOrderedList ? "#FFFFFF" : "#535862"}
              stroke={activeFormats.insertOrderedList ? "#FFFFFF" : "#535862"}
              stroke-width="0.09375"
            />
          </svg>
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeFormats.insertUnorderedList ? "btn-primary" : "btn-outline-secondary"}`}
          onClick={() => formatText("insertUnorderedList")}
          title="Bullet List"
          style={{
            padding: "4px 8px",
            fontSize: 20,
            color: activeFormats.insertUnorderedList ? "#FFFFFF" : "#535862",
            backgroundColor: activeFormats.insertUnorderedList
              ? "#007bff"
              : "transparent",
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 16 13"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1.25 10.0469C1.56909 10.0469 1.87496 10.1738 2.10059 10.3994C2.32622 10.625 2.45312 10.9309 2.45312 11.25C2.45312 11.4879 2.38214 11.7201 2.25 11.918C2.1178 12.1158 1.9298 12.2703 1.70996 12.3613C1.49029 12.4522 1.24881 12.476 1.01562 12.4297C0.782242 12.3833 0.567674 12.2688 0.399414 12.1006C0.231154 11.9323 0.116735 11.7178 0.0703125 11.4844C0.0239837 11.2512 0.047752 11.0097 0.138672 10.79C0.229734 10.5702 0.384178 10.3822 0.582031 10.25C0.779853 10.1179 1.0121 10.0469 1.25 10.0469ZM4.6875 10.3594H14.6875C14.9237 10.3594 15.1504 10.4531 15.3174 10.6201C15.4844 10.7871 15.5781 11.0138 15.5781 11.25C15.5781 11.4862 15.4844 11.7129 15.3174 11.8799C15.1504 12.0469 14.9237 12.1406 14.6875 12.1406H4.6875C4.45129 12.1406 4.22464 12.0469 4.05762 11.8799C3.89059 11.7129 3.79688 11.4862 3.79688 11.25C3.79688 11.0138 3.89059 10.7871 4.05762 10.6201C4.22464 10.4531 4.45129 10.3594 4.6875 10.3594ZM1.25 5.04688C1.56909 5.04688 1.87496 5.17378 2.10059 5.39941C2.32622 5.62504 2.45312 5.93091 2.45312 6.25C2.45312 6.4879 2.38214 6.72015 2.25 6.91797C2.1178 7.11582 1.9298 7.27027 1.70996 7.36133C1.49029 7.45225 1.24881 7.47602 1.01562 7.42969C0.782242 7.38327 0.567674 7.26885 0.399414 7.10059C0.231154 6.93233 0.116735 6.71776 0.0703125 6.48438C0.0239836 6.25119 0.047752 6.00971 0.138672 5.79004C0.229734 5.5702 0.384178 5.3822 0.582031 5.25C0.779853 5.11786 1.0121 5.04688 1.25 5.04688ZM4.6875 5.35938H14.6875C14.9237 5.35938 15.1504 5.45309 15.3174 5.62012C15.4844 5.78714 15.5781 6.01379 15.5781 6.25C15.5781 6.48621 15.4844 6.71286 15.3174 6.87988C15.1504 7.04691 14.9237 7.14062 14.6875 7.14062H4.6875C4.45129 7.14062 4.22464 7.04691 4.05762 6.87988C3.89059 6.71286 3.79688 6.48621 3.79688 6.25C3.79688 6.01379 3.89059 5.78714 4.05762 5.62012C4.22464 5.45309 4.45129 5.35938 4.6875 5.35938ZM1.25 0.046875C1.56909 0.046875 1.87496 0.173785 2.10059 0.399414C2.32622 0.625044 2.45312 0.930911 2.45312 1.25C2.45312 1.4879 2.38214 1.72015 2.25 1.91797C2.1178 2.11582 1.9298 2.27027 1.70996 2.36133C1.49029 2.45225 1.24881 2.47602 1.01562 2.42969C0.782242 2.38326 0.567674 2.26885 0.399414 2.10059C0.231154 1.93233 0.116735 1.71776 0.0703125 1.48438C0.0239835 1.25119 0.0477522 1.00971 0.138672 0.790039C0.229734 0.570197 0.384178 0.382201 0.582031 0.25C0.779853 0.117861 1.0121 0.0468751 1.25 0.046875ZM4.6875 0.359375H14.6875C14.9237 0.359375 15.1504 0.453093 15.3174 0.620117C15.4844 0.787142 15.5781 1.01379 15.5781 1.25C15.5781 1.48621 15.4844 1.71286 15.3174 1.87988C15.1504 2.04691 14.9237 2.14062 14.6875 2.14062H4.6875C4.45129 2.14062 4.22464 2.04691 4.05762 1.87988C3.89059 1.71286 3.79688 1.48621 3.79688 1.25C3.79688 1.01379 3.89059 0.787142 4.05762 0.620117C4.22464 0.453093 4.45129 0.359375 4.6875 0.359375Z"
              fill={activeFormats.insertUnorderedList ? "#FFFFFF" : "#535862"}
              stroke={activeFormats.insertUnorderedList ? "#FFFFFF" : "#535862"}
              stroke-width="0.09375"
            />
          </svg>
        </button>
      </div>
      <style jsx>{`
        [data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #6c757d;
          pointer-events: none;
          position: absolute;
          top: 12px;
          left: 12px;
        }
      `}</style>
    </>
  );
}
