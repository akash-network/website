type ProgressBarProps = {
    progress: number;
};

function ProgressBar({ progress }: ProgressBarProps) {
    return (
        <div className="w-full bg-[#E6E6E6] rounded-full h-1.5">
            <div
                className="bg-black h-full rounded-full"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
}

export default ProgressBar;
