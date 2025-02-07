---
aep: 60
title: "Akash at Home"
author: Greg Osuri (@gosuri)
status: Draft
type: Meta
created: 2024-12-01
updated: 2024-12-06
estimated-completion: 2026-03-30
roadmap: major
---

## Motivation

As AI becomes more pervasive in our daily lives, the need for secure, private home-based AI infrastructure is growing. Traditional cloud-based AI services often require sending sensitive data to remote servers, raising privacy concerns. Akash at Home addresses this by enabling users to leverage their home computing resources to host AI workloads securely within their own network.

## Summary

Akash at Home is an initiative to transform residential computing resources into powerful AI hosting environments. The project aims to:
- Utilize unused compute capacity in home environments
- Enable private, secure AI workload hosting
- Democratize access to AI infrastructure
- Create a decentralized network of home-based compute resources

## Model A: Production Grade Edge Datacenter at Home

A production-grade edge data center at home consists of high-performance computing hardware optimized for AI inference workloads. This setup enables running sophisticated AI models locally, such as DeepSeek R1 (671B parameters), achieving speeds of 3,872 tokens per second. Key components include:

- Enterprise-grade GPU infrastructure
- High-bandwidth networking
- Redundant power systems
- Advanced cooling solutions

In this scenario, we propose a topology with feasibility in Austin, Texas, where you're effectively acquiring the data center at no cost using Akash over a 5-year window.

### Hardware Requirements

- **High-Density GPU Servers:** The facility will host 5 × 8-GPU NVIDIA HGX H200 servers (total 40 GPUs). Each server is configured similarly to an AWS p5.48xlarge instance, with 8 H200 GPUs connected via NVLink/NVSwitch for high-bandwidth peer-to-peer communication (up to ~900 GB/s interconnect)​[^SECUREMACHINERY.COM]. Each server includes dual high-end CPUs (e.g. 3rd Gen AMD EPYC), ~2 TB of RAM, and ~30 TB of NVMe SSD storage, matching the p5.48xlarge specs​[^AWS.AMAZON.COM].
This ensures each server can deliver performance comparable to AWS’s top GPU instances. This ensures each server can deliver performance comparable to AWS’s top GPU instances.
- **NVLink Switch Fabric**: An NVSwitch (NVLink Switch) is integrated into each HGX H200 baseboard, allowing all 8 GPUs in a server to directly communicate at full bandwidth. This provides ~3.6 TB/s bisection bandwidth within each server​[^AWS.AMAZON.COM], critical for multi-GPU training efficiency. The NVLink/NVSwitch fabric is a core component to match AWS’s architecture.
- **Rack Infrastructure:** All equipment will be mounted in a standard 42U data center rack. The 5 GPU servers (each ~4U–6U form factor) occupy roughly 20–30U, leaving space for networking gear and cooling components. Power Distribution Units (PDUs) (likely two for redundancy) are installed in-rack to supply power to each server’s dual PSUs. The PDUs must handle high load (total ~28 kW, see power section) and provide appropriate outlets (e.g. IEC 309 or HPC connectors) on 208–240V circuits. Each server’s PSU will connect to separate A/B power feeds for redundancy.
- **Networking Hardware:** A high-bandwidth Top-of-Rack switch is required to interconnect servers and uplinks. A 10 GbE (or 25 GbE) managed switch with at least 8–16 ports will connect the GPU nodes and the uplink to the ISPs. This switch should support the full 10 Gbps Internet feed and internal traffic between servers (which may need higher throughput if servers communicate). Additionally, a capable router/firewall is needed to manage dual ISP connections and failover. For example, an enterprise router with dual 10G WAN ports can handle BGP or failover configurations for the two ISPs and Starlink backup.
- **Ancillary Components:** Miscellaneous rack components include cable management, rack-mounted KVM or remote management devices (though IPMI/BMC on servers allows remote control, minimizing on-site interaction), and environmental sensors (temperature, humidity, smoke) for monitoring. Cooling apparatus may also be integrated (e.g. a rack-mounted liquid cooling distribution unit or rear-door heat exchanger – discussed in Cooling section). All components are chosen to ensure high uptime and remote manageability, aligning with the goal of minimal on-site staff.

### Power and Cooling Considerations

#### Power Demand and Electrical Upgrades

Hosting 40 high-end GPUs in a residential building requires substantial power capacity. Each H200 GPU has a TDP around 700 W​[^TRGDATACENTERS.COM].
An 8-GPU HGX H200 server draws about 5.6 kW under load​[^TRGDATACENTERS.COM].
So five servers demand roughly 28 kW of power for the IT load alone.
This is far beyond typical residential electrical capacity, so significant electrical upgrades are needed:

- **Service Upgrade:** The building will require a new dedicated electrical service (likely 208/240V three-phase) to support ~30–40 kW continuous load.
This may involve working with the utility to install a higher-capacity transformer and service drop.
For safety and headroom, a 50–60 kW electrical capacity is advisable to account for cooling systems and margin.
- **Distribution Panel:** A new electrical sub-panel with appropriate breakers (e.g. multiple 30A or 60A circuits) will feed the data center rack PDUs.
At 28 kW IT load, multiple 208V/30A circuits (each ~5 kW usable at 80% load) or 208V/50A circuits will be needed across the PDUs.
The panel and wiring must be rated for continuous high current.
- **Power Redundancy:** Ideally dual feed lines (from separate breakers or even separate utility phases) can supply the A/B PDUs.
If the building only has one utility feed, the secondary feed could come from a UPS/generator (discussed below).
All equipment will be on UPS power to ride through short outages and ensure clean shutdown if needed.

#### Solar Power: Primary Supply vs. Cost Mitigation

The building offers 4,000 sq ft of rooftop area for solar panels. This area can host a sizable photovoltaic (PV) array, but using solar as the sole primary power source is challenging:

- **Solar Capacity:** 4,000 sq ft of modern panels (≈20 W per sq ft) can generate on the order of 75–80 kW peak DC​[^US.SUNPOWER.COM].
In peak sun, this could more than cover the ~30 kW IT load. However, that peak is only during mid-day; energy production drops in mornings, evenings, and is zero at night.
Over a full day, a 80 kW array in Austin might produce ~400–500 kWh, whereas the data center would consume ~800 kWh per day running 24/7.

- **Battery Requirement for Primary Power**: To truly run off-grid on solar, a large battery bank is needed to store excess solar energy for nighttime.
For example, supplying ~28 kW overnight (12 hours) requires >300 kWh of storage. This is equivalent to dozens of Tesla Powerwall units or industrial batteries, adding hundreds of thousands of dollars in cost.
Even then, multiple consecutive cloudy days could threaten uptime without grid/generator support. So, a pure solar-plus-battery solution has very high CapEx and complexity.

- **Solar as Cost Mitigation**: A more feasible approach is to use the solar installation to offset electricity costs and provide backup capability, rather than as the only source.
During sunny hours, the data center can draw on solar power (reducing grid consumption), and even feed surplus back to the grid if production exceeds load (via net metering or feed-in tariffs).
This lowers the electric bill significantly. At night or during high load beyond solar output, the facility would use grid power normally.
In this role, the solar array acts as a cost mitigation tool and a partial backup (able to supply some power during daytime outages).

- **Cost Comparison**: A 50–80 kW solar PV system is a major upfront investment (rough estimate $150k–$200k installed for 4000 sq ft).
As a primary power source, you’d need to roughly double this investment to include massive batteries (e.g. adding perhaps $300k+ for storage and grid-islanding inverters), totaling near half a million dollars in CapEx.
In contrast, using solar without extensive storage keeps the cost to the PV array itself and maybe a modest battery/UPS, leveraging the grid for reliability.
The grid electricity cost in Austin ($0.08–$0.12 per kWh) is relatively low, so completely offsetting it with solar has a long payback.

**Recommendation**: Use solar as a supplemental power source to shave peak usage and reduce energy costs, rather than sole supply.
This yields savings (potentially tens of thousands per year) while avoiding the impractical cost of running 24/7 on solar alone.

### Cooling Solutions for High-Density GPUs

Dissipating ~28 kW of heat in a small residential space is a critical challenge. Traditional comfort HVAC is insufficient, so purpose-built cooling is required.
Key considerations are efficiency, space footprint, and ease of maintenance:

- **Air Cooling (CRAC/CRAH Units)**: One option is installing a dedicated computer room A/C (CRAC) or in-row cooling unit.
For ~30 kW heat, this might involve multiple 5-ton (60,000 BTU) air conditioning units or a single precision cooling unit.
While effective, standard air conditioners would occupy significant indoor space or require large condenser units outside.
They also need frequent maintenance (filters, coolant checks) and may struggle on extremely hot days.
In a rooftop deployment, direct-expansion HVAC units could be placed outside with ducting to the server room.

- **Liquid Cooling (Direct-to-Chip or Rear-Door)**: Given the high heat density, liquid cooling is often more efficient.
One approach is direct-to-chip water blocks on the GPUs/CPUs, with a coolant distribution unit pumping liquid to a roof-mounted dry cooler or chiller.
Another compact approach is a rear-door heat exchanger: a radiator panel is installed as the rack’s rear door, absorbing the hot air from servers and cooling it via circulating water.
Rear-door units can handle 30+ kW per rack and require only a water loop to an external cooler.
This method has a minimal footprint (no extra floor space) and is relatively low maintenance (closed-loop water circuit with pumps).
It’s also “close-coupled” to the heat source, improving efficiency.

- **Immersion Cooling**: Immersion in dielectric fluids is a cutting-edge solution where servers are submerged in cooling fluid. It can easily dissipate high heat loads and simplifies heat rejection (via external radiators). However, it requires specialized tank enclosures and complicates maintenance (servers must be lifted out for service). In a small operation with only 5 servers, immersion may add unnecessary complexity and make quick hardware swaps harder.

**Recommended Cooling Solution**: A liquid cooling system is the most effective for this scenario. For example, equipping the HGX servers with water-cooled plates or using a rear-door liquid cooling unit would efficiently remove heat.
The heat could be expelled via a roof-mounted dry cooler or small chiller unit, taking advantage of outside air to dump heat.
This setup keeps the cooling infrastructure compact (mostly confined to the rack and a box on the roof) and maintenance is straightforward (primarily monitoring coolant and pump health).
It also keeps the room temperature moderate, which is important in a residential building to avoid hot spots.
Overall, liquid cooling provides high performance per footprint and aligns with sustainability (higher efficiency means lower cooling power draw, improving the PUE).
TRG Datacenters notes the availability of “waterless cooling” and advanced techniques for H100/H200 deployments​[^TRGDATACENTERS.COM] – a sign that traditional air cooling alone is not ideal for these 5.6 kW servers.

### Backup Power and Power Conditioning

For reliable operations, especially if leasing compute to customers, the data center must handle power outages or grid anomalies seamlessly:

- **Battery UPS**: A battery Uninterruptible Power Supply is critical. This can be a large centralized UPS cabinet or distributed lithium-ion battery units.
The UPS provides instant failover power and voltage conditioning. It would carry the ~30 kW load for a short period (minutes to perhaps an hour) to ride out brief outages or to cover the gap until a generator starts.
Modern lithium-ion UPS systems or even a set of Tesla Powerwall batteries could serve this role. 
For example, a 100 kW (several hundred kWh) battery system could keep the facility running for a few hours if needed, and also store solar energy for use in the evening peak.

- **Diesel (or Natural Gas) Generator**: For longer power outages, a generator ensures continued operation.
A diesel generator around 50–60 kW capacity (to handle 30 kW IT load + cooling equipment and some buffer) would be installed (likely on the roof or a pad outside).
Upon a grid outage, it would auto-start (via ATS – automatic transfer switch) and take over from the UPS within 30–60 seconds.
This provides virtually indefinite backup as long as fuel is available.
Diesel is common for data centers, but a natural gas generator could be considered if a gas line is available, to avoid fuel storage.
In either case, the generator and fuel system add cost and maintenance (fuel checks, periodic test runs), but they are necessary for high uptime.

- **Redundancy**: The combination of grid power + solar + UPS + generator creates multiple power layers. The primary source is grid (augmented by solar when available).
If grid fails, the UPS instantly holds up the load. For short outages (< 5 minutes), the battery might suffice alone.
If the outage persists, the generator starts and powers the facility until grid returns. Solar, if sun is up, can extend battery life or reduce generator fuel usage by sharing the load.
This multi-tier setup provides resilience. All critical power feeds (UPS output, generator output) tie into a transfer switch gear that feeds the main panel and PDUs, so the switchover is automatic and transparent to the servers.

- **Power Conditioning**: The sensitive (and expensive) GPU servers benefit from clean, stable power. The UPS and power distribution system will regulate voltage and filter surges.
Additionally, surge protectors and proper grounding are implemented in the electrical design. These measures protect the hardware from power spikes or sags common in city grids.

### Networking & Connectivity

Reliable, high-bandwidth internet is essential for leasing servers on Akash. The plan includes a 10 Gbps bandwidth setup with multiple providers for redundancy:

- **Primary ISP (Fiber)**: A business-grade fiber optic connection providing ~10 Gbps symmetrical bandwidth will be the main uplink.
Fiber offers low latency and high throughput, important for moving large datasets to/from the GPUs. In Austin, options include providers like AT&T Business Fiber or local ISPs.
A dedicated 10 Gbps enterprise line typically comes with an SLA (Service Level Agreement) for uptime, but at a high cost (often thousands of dollars per month, exact quotes vary​[^GIGAPACKETS.COM]
). If full 10 Gbps dedicated service is too costly initially, a slightly lower tier (e.g. 5 Gbps) business line could be used, but given the data-intensive nature of GPU workloads, planning for 10 Gbps is prudent.

- **Secondary ISP (Alternative Path)**: For redundancy, a second independent internet service will be provisioned. This could be a different fiber provider or a cable/fixed wireless provider.
One cost-effective option in Austin is Google Fiber’s 8 Gbps residential service, priced around $150/month​[^FIBER.GOOGLE.COM].
While technically a residential plan, 8 Gbps “Edge” service offers enormous bandwidth at low cost – however, it lacks the guaranteed uptime of a business line.
Another option is a 1–2 Gbps cable or fiber line from a different carrier (for example, if AT&T is primary, perhaps Spectrum or Zayo fiber as secondary).
The goal is path diversity, so ideally the secondary uses a different infrastructure. This dual ISP setup allows failover if the primary line experiences an outage or performance issues.

- **Starlink Satellite Backup**: As a tertiary backup, Starlink Business satellite internet will be installed. Starlink can provide on the order of 100–200 Mbps downlink in the Austin area.
While far below 10 Gbps, it is entirely independent of local terrestrial infrastructure.
In an extreme scenario where both fiber links are down (e.g. widespread outage or fiber cut), Starlink ensures the data center is still reachable for basic management traffic and possibly to serve low-bandwidth client needs.
The latency (20–40 ms) and bandwidth of Starlink aren’t ideal for heavy data transfer, but it’s sufficient as an emergency link.
The cost for Starlink Business is a few hundred dollars per month, which is a reasonable insurance policy for continuity.

- **Networking Equipment & Configuration**: A robust networking setup will tie these links together. A dual-WAN router or firewall (with support for load balancing/failover and BGP if using provider-independent addressing) will manage traffic.
In normal operation, the 10 Gbps primary carries the load; the secondary link can either remain idle hot-spare or be used in active-active mode (e.g. serve less critical traffic or load-balance outgoing requests).
The router will automatically fail over traffic to the secondary (or Starlink) if the primary drops.
Internally, the Top-of-Rack switch connects the servers at 10/25 Gbps and uplinks to the router at 10 Gbps.
This ensures each GPU server can fully utilize the internet pipe when needed.
All networking gear will have redundant power (connected to the UPS) to stay online during power events.

- **Cost and Reliability Comparison**: The fiber business line offers the best reliability (uptimes >99.9% typically) but at high monthly cost.
The residential-style multi-gig fiber is much cheaper (e.g. $150/mo for 8 Gbps)​[^FIBER.GOOGLE.COM] but comes with no guaranteed uptime – repairs could take days if it fails.
By employing both, we get a balance: the cheap pipe can carry traffic most of the time, but if it fails, the expensive pipe ensures SLAs are met.
In effect, one could even invert the usage (use the cheap Google Fiber as primary under normal conditions to save money, and have the business fiber as the backup for SLA).
Regardless, with two wired providers and Starlink, the facility is well protected against outages, meeting enterprise connectivity standards.

### Financial Projections and Profitability

This section outlines the expected capital expenditures, operating costs, and revenue/profit over a 5-year period for the edge data center. All values are estimates based on current market data and historical trends.

#### Capital Expenditures (CapEx)

One-time setup costs (Year 0 investments) include:

- **GPU Servers**: 5 high-end 8×H200 servers. NVIDIA H200 GPUs are estimated at ~$30k each, and complete 8-GPU systems range $275k–$500k depending on configuration​[^TRGDATACENTERS.COM].
We assume ~$300k per server for a mid-range configuration. Total: ~$1.5 million for all servers. This covers GPUs, CPUs, memory, NVSwitch, etc.

- **Rack & Power Infrastructure**: Rack enclosure, dual PDUs, cabling, and building electrical upgrade. The electrical work (new panel, transformer, wiring) might cost $20k–$50k, and rack hardware another ~$5k–$10k. Estimated: $30k.

- **Cooling System**: If using liquid cooling, costs include coolant distribution units, piping, and a dry cooler/chiller. A high-capacity HVAC or liquid loop for ~30 kW could be $40k–$80k. We budget ~$50k for the cooling solution (e.g. rear-door heat exchanger and external radiator).

- **Networking Gear**: Enterprise 10 GbE switch, dual-WAN router, and misc. networking equipment. Estimated: $15k for a quality switch and router with 10G capability.

- **Solar Installation**: ~70–80 kW of solar panels (max that fits on 4,000 sq ft) at roughly $2/W. Estimated: $150k for the solar array (inverters, panels, mounting). This is an optional cost – included if we aim to deploy solar upfront. (If treating solar as a separate project, this could be deferred or scaled in phases to manage cash flow.)

- **Battery UPS & Generator**: A battery UPS sized for the load (could be integrated in a large UPS unit or several battery packs) and a 50–60 kW diesel generator with ATS. Rough costs: $50k for a substantial UPS system, and $40k–$60k for the generator + install. Assume $100k total for backup power infrastructure.

- **Total CapEx**: Approximately $1.8 – $1.9 million. For instance, adding the mid estimates above: $1.5M (servers) + $30k (power) + $50k (cooling) + $15k (network) + $150k (solar) + $100k (UPS+gen) ≈ $1.845M. Without solar (if one chose to initially rely on grid power), CapEx would be about $1.695M. These figures set the stage for amortization and ROI calculations.

#### Operating Expenses (OpEx)

Ongoing yearly costs include:

- **Power Consumption**: The GPUs and cooling will draw ~30–35 kW continuously. Yearly energy usage is 260,000 kWh (30 kW × 8760 hours, assuming some efficiency gains from liquid cooling). At an Austin commercial electricity rate ($0.10 per kWh), that’s about $26k/year in electricity costs. With the solar array offsetting perhaps ~50% of that (on sunny days the solar can supply a large portion of daytime power), the net grid electricity cost could drop to ~$12k–$15k/year. (This assumes the ~80 kW solar produces ~140 MWh/year that either directly powers load or is net-metered – saving ~$14k/year in power). We’ll use ~$15k/year net power cost assuming solar is active; ~$30k/year if not.

- **Internet Connectivity**: Dual ISP fees and Starlink subscription. The primary business 10G line might be ~$1,000–$2,000/month, and backup lines (Google Fiber 8G and Starlink) another few hundred each. Budget roughly $2,500/month total for connectivity. Annual: ~$30k/year on internet service. (Using a residential primary could cut this significantly, but we’ll stay conservative to ensure quality of service.)

- **Hardware Maintenance**: With minimal on-site staff, maintenance involves remote management and occasional contractor visits. We budget a small amount for maintenance contracts/spares – e.g. replacing failed components (disks, fans) and annual preventative maintenance on generator, cooling, etc. Estimated: $10k/year. (This could be higher if we include, say, a support contract for the servers or insurance. But since on-site staff is minimal, we assume only incidental costs.)

- **Miscellaneous**: Insurance for equipment, property tax on equipment (if applicable), and other overhead. This might add a few thousand. We’ll include $5k/year as a buffer.

Combining these, the annual OpEx is roughly $60k/year (with solar) or ~$75k/year (without solar), dominated by power and internet bandwidth costs.

#### Revenue Model and Utilization

The revenue comes from leasing the GPU servers on the Akash network (or similar). Assumptions:

- **Lease Rate**: The H200 GPUs are leased at $2.30 per hour per GPU (initial market rate, comparable to high-end H100 pricing). This equals $55.20 per GPU per day if fully utilized.

- **Utilization**: Assume an average 80% utilization in Year 1 – meaning each GPU is earning revenue ~19.2 hours out of 24. (Some downtime for when not leased or for maintenance). 80% is a reasonable starting point given ramp-up of clients and some idle periods.

- **Year 1 Revenue**: There are 40 GPUs total. At $2.3/hr with 80% usage, each GPU yields ~$16,120 per year. Annual Year-1 revenue ≈ $645,000 (40 × $16,120). Calculation: 40 × $2.3 × 0.8 × 24 × 365 ≈ $644,700.
This half-million-plus revenue in the first year assumes there is sufficient demand to keep the GPUs busy (which for cutting-edge H200s is likely, given heavy AI workload demand).

However, market lease rates for GPUs tend to decline over time. New GPU generations and increased supply drive prices down. 
For example, rentals of NVIDIA H100 GPUs dropped from around $8/hour at launch to under $2/hour within a year as supply caught up​[^LATENT.SPACE].
We must factor in that our $2.30/hr rate may not hold steady for 5 years:

We project the effective lease rate per H200 GPU will depreciate each year. Based on historical trends, a drop on the order of 10–15% per year is plausible if new competitors (like NVIDIA Blackwell series) emerge.
We will model a conservative scenario: Year 2 ~$2.00/hr, Year 3 ~$1.70/hr, Year 4 ~$1.50/hr, Year 5 ~$1.30/hr on average.
Utilization might increase as the service gains customers (perhaps up to 90%), but to keep estimates simple we’ll hold 80% utilization and focus on rate decline. 
This decline in price is analogous to how the asset value depreciates – GPUs lose value as newer models appear. (In fact, high-end GPUs are among the fastest depreciating tech assets​[^BIGDATASUPPLY.COM].)
Historically, a GPU can lose ~50% of value in the first year, and ~75% by year three​[^BIGDATASUPPLY.COM].
Rental pricing mirrors this as older GPUs command lower rates. Our revenue model accounts for this by lowering the hourly rate over time.  5-Year Revenue Projection (with 80% utilization):

| Year | Avg Lease Rate (USD/GPU/hr) | Annual Revenue (approx) |
| ---- | -------------------------- | ---------------------- |
| 1    | $2.30                      | $645,000               |
| 2    | $2.00 (-13%)               | ~$561,000              |
| 3    | $1.70 (-15%)               | ~$477,000              |
| 4    | $1.50 (-12%)               | ~$420,000              |
| 5    | $1.30 (-13%)               | ~$364,000              |

*(The rate percentages indicate the drop from the previous year. Utilization kept at 80% for consistency.)*

Over five years, the cumulative revenue would be roughly ~$2.46 million. This assumes that demand remains high enough to keep 80% of capacity leased even as prices drop. In practice, we might increase utilization in later years (e.g. to 85–90%) as the service matures, which could somewhat offset the lower hourly rates.

#### 5-Year Profitability Outlook

To evaluate profitability, we compare the revenue against expenses and include the residual value of hardware after 5 years:

- **Yearly Operating Profit**: Subtracting the ~$60k OpEx per year from the revenues above, we get the annual net income from operations.
For example, Year 1 OpEx ~$60k, so profit ~$585k. By Year 5, revenue ~$364k minus OpEx ~$60k = $304k profit.

- **CapEx Recovery**: The initial CapEx ($1.85M with solar) is a sunk cost to recover over time. We can amortize it linearly ($370k per year over 5 years) as a target.
In Year 1, the $585k operating profit easily covers the $370k amortization (leaving $215k surplus).
By Year 5, the $304k profit is slightly below a $370k straight-line amortization, reflecting how revenue declines over time.

- **Cumulative Cashflow**: Summing the annual profits: Year1 $585k, Year2 ~$501k, Year3 ~$417k, Year4 ~$360k, Year5 ~$304k yields about $2.17 million total pre-tax profit over 5 years.
This is in the same ballpark as the ~$1.85M initial investment, indicating a modest net gain by the end of year 5.

- **Resale Value**: After 5 years, the H200 servers will be older tech, but not worthless. If history is a guide, high-end GPUs might retain perhaps 10–20% of their value after 5 years (many will have moved to next-next-generation by then).
For instance, 5-year-old NVIDIA V100 GPUs sell for only ~5–10% of original price on secondary markets. We’ll assume ~15% residual value for our equipment.
On a $1.5M server investment, that’s about $225k salvage value by selling the used servers or GPUs in year 5. This adds to the project’s return.

- **ROI and Payback**: Considering the ~$2.17M cumulative profit plus ~$225k resale, the 5-year return is ~$2.395M on a $1.845M investment.
That’s an overall ROI of ~30% over 5 years, or roughly a 6% annualized return. Payback period (time to recoup the initial outlay from net cash flow) would be around 3.5–4 years in this scenario (cumulative profit crosses the initial cost in the latter half of year 4).
After 5 years, the operation has paid for itself and earned a modest profit on top.

- **Effect of Solar on Financials**: We included solar in CapEx and reduced annual power cost. If we exclude solar, initial CapEx drops by ~$150k (to ~$1.695M) but annual power costs rise by ~$14k (to ~$75k/year).
Over 5 years, not having solar would save $150k upfront but cost ~$70k more in OpEx, netting a $80k benefit by year 5.
This slightly improves short-term ROI (and earlier breakeven). However, solar’s 25+ year lifespan means after its ~10-year payoff period it would yield pure savings.
In a 5-year window, solar is close to break-even (especially with no subsidies assumed).
For a pure profitability standpoint, one might delay or scale the solar investment, but from a feasibility and sustainability view, using the rooftop for solar is still attractive for long-term gains and resiliency.

- **Price/Utilization Sensitivity**: The above outlook is sensitive to how well the GPUs are monetized. If demand is higher (90%+ utilization), revenues would increase ~12.5%, boosting profits.
Conversely, if competition forces prices down faster (say to $1/hr by year 5), total revenue would be lower.
The good news is that even under quite conservative pricing, the operation remains profitable within 5 years, largely because the upfront purchase avoids cloud markups. 
(Note: cloud GPU instances can cost 2–3× the equivalent hardware cost over a few years​[^TRGDATACENTERS.COM], so owning hardware can pay off if utilization is high.)

### Feasibility Assessment

In summary, setting up an edge GPU data center in a residential building is feasible but requires careful planning:

- Significant infrastructure upgrades (power and cooling) are needed to support the high-density servers in a non-datacenter environment.
- The project is capital-intensive (~$1.8M upfront), but operational costs are relatively low once running (mainly power and internet).
- **Profitability**: The 5-year projection shows a reasonable profit margin, though not astronomical.
There is room for higher returns if the facility achieves higher utilization or if hardware costs can be sourced lower.
Conversely, rapid GPU price drops and under-utilization are risks (the GPU rental market can fluctuate – e.g. an oversupply situation drove H100 rental rates down to ~$2/hr​[^LATENT.SPACE]).
We mitigated this by using a declining price model in our estimates.
- The edge location (in Austin) can actually be a selling point: users in the region get lower latency and data sovereignty compared to using distant cloud data centers. This could help maintain higher utilization.
- **Maintenance and Operations**: With remote management, the ongoing effort is low. The main operational tasks will be monitoring systems, applying software updates, and arranging repairs for any failed hardware.
The design with redundant power and connectivity ensures a high service uptime, which is crucial for attracting customers.

Overall, the analysis indicates that an edge data center with 5×HGX H200 servers can be run in a retrofitted residential building space and achieve profitable operations within 5 years. While it won’t rival a hyperscale cloud in scale, it leverages owned infrastructure and renewable energy to deliver competitive GPU compute at a regional edge, aligning with the growing trend of decentralized, on-premise AI computing​[^TRGDATACENTERS.COM].

## References

[^TRGDATACENTERS.COM]: [NVIDIA H200 specifications and power requirements](https://www.trgdatacenters.com/resource/nvidia-h200)
[^AWS.AMAZON.COM]: [AWS p5 instance (8×H100) configuration for reference​](https://aws.amazon.com/blogs/aws/new-amazon-ec2-p5-instances-powered-by-nvidia-h100-tensor-core-gpus-for-accelerating-generative-ai-and-hpc-applications/)
[^SECUREMACHINERY.COM]: [Sizing an LLM for GPU memory](https://securemachinery.com/category/aws/)
[^US.SUNPOWER.COM]: [Solar panel power density (≈20 W/sq ft)​](https://us.sunpower.com/blog/how-much-solar-power-produced-square-foot)
[^FIBER.GOOGLE.COM]: [Google Fiber 8 Gbps service pricing in Austin​](https://fiber.google.com/austin/)
[^LATENT.SPACE]: [GPU lease market trends (H100 price drop)​](https://www.latent.space/p/gpu-bubble)
[^BIGDATASUPPLY.COM]: [Typical GPU depreciation over time​](https://bigdatasupply.com/sell-your-i-t-equipment/sell-gpu/)
[^GIGAPACKETS.COM]: [Gigapackets 10 Gbps business line pricing in Austin​](https://www.gigapackets.com/10Gigabit/texas/austin.php)