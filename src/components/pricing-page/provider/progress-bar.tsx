type ProgressBarProps = {
    progress: number;
    max: number;
};

function ProgressBar({ progress, max }: ProgressBarProps) {
    return (
        <div className="w-full bg-[#E6E6E6] rounded-full h-1.5">
            <div
                className="bg-black h-full rounded-full"
                style={{ width: `${progress / max * 100}%` }}
            />
        </div>
    );
}

export default ProgressBar;
