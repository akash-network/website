import awsLogo from '../../../assets/aws-logo.svg'
import gcpLogo from '../../../assets/gcp-logo.svg'
import azureLogo from '../../../assets/azure-logo.svg'


const Compare = () => {
    const mock = 25.12
    return (
        <div className="flex flex-col gap-5">
            <div className="rounded-md border p-3 shadow-smbg-white">
                <div className="flex gap-4 items-center pb-2 border-b">
                    <img src={awsLogo.src} alt="akash-logo" />
                    <p className="font-semibold text-black">AWS</p>
                </div>
                <div className="flex justify-between pt-2">
                    <p className="text-sm font-medium">Estimated Cost:</p>
                    <p className="text-[21px] leading-[28px] font-semibold text-black">
                        ${mock}
                    </p>
                </div>
            </div>
            <div className="rounded-md border p-3 shadow-smbg-white">
                <div className="flex gap-4 items-center pb-2 border-b">
                    <img src={gcpLogo.src} alt="akash-logo" />
                    <p className="font-semibold text-black">GCP</p>
                </div>
                <div className="flex justify-between pt-2">
                    <p className="text-sm font-medium">Estimated Cost:</p>
                    <p className="text-[21px] leading-[28px] font-semibold text-black">
                        ${mock}
                    </p>
                </div>
            </div>
            <div className="rounded-md border p-3 shadow-smbg-white">
                <div className="flex gap-4 items-center pb-2 border-b">
                    <img src={azureLogo.src} alt="akash-logo" />
                    <p className="font-semibold text-black">Azure</p>
                </div>
                <div className="flex justify-between pt-2">
                    <p className="text-sm font-medium">Estimated Cost:</p>
                    <p className="text-[21px] leading-[28px] font-semibold text-black">
                        ${mock}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Compare;
