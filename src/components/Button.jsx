import React from "react";

export default function Button({
    variant = "primary",
    className = "",
    ...props
}) {
    const base =
        "inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-60 disabled:cursor-not-allowed";
    const styles = {
        primary: "bg-slate-900 text-white hover:bg-slate-800 cursor-pointer",
        secondary:
            "bg-slate-100 text-slate-900 hover:bg-slate-200 cursor-pointer",
        danger: "bg-red-600 text-white hover:bg-red-500 cursor-pointer",
    };
    return (
        <button
            className={`${base} ${styles[variant]} ${className}`}
            {...props}
        />
    );
}
