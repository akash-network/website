import { Info } from "lucide-react";

function Disclaimer() {
    return (
        <div className="flex gap-1 items-center">
            <p className="text-sm font-medium">Disclaimer</p>
            <Info
                size={14}
                className="text-[#9D9C9C] dark:text-[#3E3E3E]"
            />
        </div>
    );
}

export default Disclaimer;
