import styles from "../../styles/reusable-components/camera-button.module.css"
import { Variant, motion } from "framer-motion"
import { useState } from "react"
import { useScreenshot } from "../reusable/ScreenshotContainer"

const CameraButton = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [isCopied, setIsCopied] = useState(false)

    const handleSuccess = async (blob: Blob) => {
        try {
            await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })])
            setIsLoading(false)
            setIsCopied(true)
            setTimeout(() => {
                setIsCopied(false)
            }, 2000)
        } catch (e) {
            console.error(e)
        }
    }

    const handleFailure = () => setIsLoading(false)

    const { takeScreenshot } = useScreenshot({
        onSuccess: handleSuccess,
        onFailure: handleFailure
    })

    const handleClick = () => {
        if (!isLoading && !isCopied) {
            setIsLoading(true)
            takeScreenshot()
        }
    }

    // const animate = isLoading ? "loading" : isCopied ? "copied" : "normal"
    const animate = "loading"
    return (
        <motion.button
            className={styles["screenshot-button"]}
            onClick={handleClick}
            animate={animate}
            variants={variants.button}>
            <motion.svg
                preserveAspectRatio={"xMidYMid"}
                viewBox={"0 0 63.19 63.19"}
                height={20}
                width={20}>
                {/* This is the default view */}
                {/* TODO replace this with clipboard SVG */}
                <g>
                    <motion.circle
                        stroke={"#FFFFFF"}
                        strokeWidth={"7"}
                        fill={"transparent"}
                        cx={31.59}
                        cy={31.59}
                        r={24}
                        key={"circle"}
                        variants={variants.copy}
                        animate={animate}
                    />
                </g>

                {/* This is the loading view */}
                <motion.g
                    animate={animate}
                    variants={variants.loader}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                    <motion.path
                        opacity={0.2}
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12 19C15.866 19 19 15.866 19 12C19 8.13401 15.866 5 12 5C8.13401 5 5 8.13401 5 12C5 15.866 8.13401 19 12 19ZM12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                        fill="#000000"
                    />
                    <motion.path
                        d="M2 12C2 6.47715 6.47715 2 12 2V5C8.13401 5 5 8.13401 5 12H2Z"
                        fill="#000000"
                    />
                </motion.g>

                {/* This is the copied view */}
                <g>
                    <motion.circle
                        stroke={"#FFFFFF"}
                        strokeWidth={"7"}
                        fill={"transparent"}
                        cx={31.59}
                        cy={31.59}
                        r={24}
                        key={"circle"}
                        animate={animate}
                        variants={variants.circle}
                    />
                    <motion.path
                        stroke={"#FFFFFF"}
                        strokeWidth={"7"}
                        strokeLinecap={"round"}
                        fill={"transparent"}
                        d={"M17.29 31.59l10.98 10.42 17.49-18.23"}
                        key={"check"}
                        animate={animate}
                        variants={variants.path}
                    />
                </g>
            </motion.svg>
        </motion.button>
    )
}

const variants = {
    button: {
        copied: {
            backgroundColor: "rgba(66, 245, 90, 0.7)"
        }
    },
    copy: {
        normal: { scale: 1, opacity: 1 },
        copied: { scale: 0, opacity: 0 },
        loading: { scale: 0, opacity: 0 }
    },
    loader: {
        normal: { opacity: 0 },
        loading: { opacity: 1, rotate: 360, width: "20px", height: "20px" },
        copied: { opacity: 0 }
    },
    circle: {
        normal: { scale: 0, opacity: 0 },
        copied: { scale: 1, opacity: 1 },
        loading: { scale: 0, opacity: 0 }
    },
    path: {
        normal: { opacity: 0, pathLength: 0 },
        loading: { opacity: 0, pathLength: 0 },
        copied: { opacity: 1, pathLength: 1 }
    }
} satisfies Record<
    string,
    {
        normal?: Variant
        loading?: Variant
        copied?: Variant
    }
>

export default CameraButton