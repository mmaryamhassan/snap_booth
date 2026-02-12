import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";
import captureIcon from "../assets/capture.png";
import logoIcon from "../assets/icon.png";
import { toast } from "react-toastify";

function WebCamera() {
    const webcamRef = useRef(null);

    const [showCamera, setShowCamera] = useState(false);
    const [filter, setFilter] = useState("none");

    const [showSmile, setShowSmile] = useState(false);
    const [blink, setBlink] = useState(false);
    const [countdown, setCountdown] = useState(null);
    const [isCapturing, setIsCapturing] = useState(false);
    
    const [showGallery, setShowGallery] = useState(false);
    // const [isGalleryOff, setIsGalleryOff] = useState(false);
    const [snaps, setSnaps] = useState([]);


    useEffect(() => {
        const timer = setTimeout(() => setShowCamera(true), 3000);
        return () => clearTimeout(timer);
    }, []);

    const applyFilterToImage = (imageSrc, filter) => {
        return new Promise((resolve) => {
            // const img = new Image();
            // img.src = imageSrc;
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = imageSrc;
            img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;

            const ctx = canvas.getContext("2d");

            // Map your filters to canvas filters
            switch (filter) {
                case "glow":
                ctx.filter = "brightness(1.4) saturate(1.4)";
                break;
                case "sepia":
                ctx.filter = "sepia(1)";
                break;
                case "aesthetic":
                ctx.filter = "contrast(1.25) saturate(1.5) hue-rotate(15deg)";
                break;
                case "black":
                ctx.filter = "grayscale(1) brightness(0.8) contrast(1.2)";
                break;
                default:
                ctx.filter = "none";
            }

            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL("image/jpeg"));
            };
        });
    };

    const capture = React.useCallback(() => {
        if (!webcamRef.current || isCapturing) return;

        setIsCapturing(true);
        let count = 3;
        setCountdown(count);

        const countdownInterval = setInterval(() => {
            count -= 1;
            setCountdown(count);

            if (count === 0) {
                clearInterval(countdownInterval);
                setCountdown(null);

                setShowSmile(true);

                setTimeout(async () => {
                    const rawImage = webcamRef.current.getScreenshot();
                    const filteredImage = await applyFilterToImage(rawImage, filter);
                    setSnaps((prev) => [filteredImage, ...prev]);
                    setShowGallery(true);
                    setShowSmile(false);
                    setBlink(true);
                    setTimeout(() => setBlink(false), 150);
                    setIsCapturing(false);
                }, 1500);
            }
        }, 1000);
    }, [filter, isCapturing]);

    // downloading snaps
    const downloadSnaps = () => {
        snaps.length === 0 ? 
        toast.error("No snaps to download") :
        snaps.forEach((snap,index) => {
            const link = document.createElement('a');
            link.href = snap;
            link.download = `snap_${index + 1}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            console.log("snap downloaded");
            toast.success("Snaps downloaded successfully!");
        })
    };

    // deleting snaps
    const deleteSnaps = () => {
        snaps.length === 0 ? toast.error("No snaps to delete") : setSnaps([]);
        toast.info("All snaps deleted");
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-linear-to-br from-rose-200 via-pink-300 to-fuchsia-400 ">
        <AnimatePresence>
            {/* when camera is off  */}
            {!showCamera ? (
            <motion.div
                key="intro"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="text-center px-6"
            >
                <h1 className="text-4xl md:text-5xl font-bold text-[#CD2C58]">
                Capture your aesthetic moments
                </h1>
                <p className="text-3xl mt-3 text-[#CD2C58] font-semibold">
                with SnapBooth
                </p>
                <img
                src={logoIcon}
                alt="SnapBooth logo"
                className="w-20 h-20 mx-auto mt-4 rounded-full"
                />
            </motion.div>
            ) : (
            // when camera is on
            <motion.div
                key="camera"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center"
            >
                {/* Blink */}
                {blink && (
                <div className="absolute inset-0 bg-white z-40 rounded-3xl" />
                )}
                
                {/* Webcam */}
                <Webcam
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                mirrored
                videoConstraints={{ facingMode: "user" }}
                className={`rounded-3xl border-8 border-pink-200 shadow-lg
                    ${filter === "glow" && "brightness-150 saturate-150"}
                    ${filter === "sepia" && "sepia"}
                    ${filter === "aesthetic" && "contrast-125 saturate-150 hue-rotate-15"}
                    ${filter === "black" && "grayscale brightness-75 contrast-125"}
                `}
                />

                {/* Countdown */}
                {countdown && (
                <motion.div
                    initial={{ scale: 0.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute z-30 text-5xl font-serif text-black drop-shadow-lg"
                >
                    {countdown}
                </motion.div>
                )}

                {/* Smile */}
                {showSmile && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute z-30 text-5xl font-serif text-black drop-shadow-lg"
                >
                    Smile...
                </motion.div>
                )}

                {/* snap gallery */}
                {showGallery && (
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ type: "spring", stiffness: 120 }}
                        className="fixed top-64 left-4 right-4 z-50 md:absolute md:top-10 md:right-10 md:left-auto md:w-68 md:h-auto bg-white/80 backdrop-blur-md rounded-2xl border-4 border-pink-200 shadow-lg overflow-hidden"
                    >
                        <h2 className="text-center text-2xl font-semibold text-amber-600 mt-2 mb-3">
                        Your Snaps
                        </h2>
                        <button
                            onClick={() => setShowGallery(false)}
                            className="absolute bg-gray-500 p-1 px-2 top-2 right-2 text-white hover:text-amber-800 rounded-full font-bold hover:bg-amber-300 transition-colors"
                        >
                            X
                        </button>

                        <div className="overflow-y-auto max-h-[45vh] md:max-h-[420px] p-2">
                        {snaps.length === 0 ? (
                            <p className="text-center text-amber-600">
                            No snaps yet!
                            </p>
                        ) : (
                            snaps.map((snap, index) => (
                            <img
                                key={index}
                                src={snap}
                                alt={`Snap ${index}`}
                                className="w-full h-auto object-cover rounded-lg mb-2"
                            />
                            ))
                        )}
                        </div>

                        <button
                        className="w-full py-2 bg-amber-500 text-white font-semibold
                                    hover:bg-amber-600 transition-colors"
                        onClick={downloadSnaps}
                        >
                            Download Snaps
                        </button>
                        <button
                            className="w-full py-2 bg-red-500 text-white font-semibold
                                        hover:bg-red-600 transition-colors"
                            onClick={deleteSnaps}
                        >
                            Delete Snaps
                        </button>
                    </motion.div>
                )}


                {/* Controls */}
                <div className="flex gap-4 mt-5">
                    {/* Glow */}
                    <motion.button
                        whileTap={{ scale: 0.9 }}

                        onClick={() => setFilter("glow")}
                        className="w-14 h-14 flex items-center justify-center 
                                border-4 border-white rounded-full bg-white/80
                                hover:border-yellow-400"
                    >
                        <img src="https://freepngimg.com/save/122142-light-circle-glow-effect-multicolored/650x650" alt="glowfilter" />
                    </motion.button>

                    {/* Sepia */}
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setFilter("sepia")}
                        className="w-14 h-14 flex items-center justify-center 
                                border-4 border-white rounded-full bg-white/80 hover:border-yellow-400"
                    >
                        <img src="https://e1.pxfuel.com/desktop-wallpaper/539/682/desktop-wallpaper-old-film-sepia-animation-motion-backgrounds-sepia-effect-backgrounds-thumbnail.jpg" alt="sepiafilter" className="rounded-full h-10" />
                    </motion.button>

                    {/* Capture btn */}
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={capture}
                        disabled={isCapturing}
                        className="w-14 h-14 rounded-full"
                    >
                        <img
                        src={captureIcon}
                        alt="Capture"
                        className="w-14 h-14 border-4 border-white rounded-full bg-[#88b3e4]
                                    cursor-pointer transition-transform duration-200 hover:scale-105"
                        />
                    </motion.button>

                    {/* Aesthetic */}
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setFilter("aesthetic")}
                        className="w-14 h-14 flex items-center justify-center 
                                border-4 border-white rounded-full bg-white/80 hover:border-yellow-400"
                    >
                        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBC6WhPNMcynCjx-EsEPDx7FaTJYVXR0XPNw&s" alt="aestheticfilter" className="rounded-full h-12" />
                    </motion.button>

                    {/* Black */}
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setFilter("black")}
                        className="w-14 h-14 flex items-center justify-center 
                                border-4 border-white rounded-full bg-white/80 hover:border-yellow-400"
                    >
                        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQ1G4ODon8mQktdqdpONFDoE-m1hlaQTu4Qw&s" alt="darkblackfilter" className="rounded-full h-12" />
                    </motion.button>

                    <button className="bg-amber-500 text-white font-bold px-4 py-1 rounded-full hover:bg-amber-600 transition-colors ml-5"
                    onClick={() => {setShowGallery(true)}}>
                        Snaps
                    </button>
                </div>
            </motion.div>
            )}
        </AnimatePresence>
        </div>
    );
}

export default WebCamera;
