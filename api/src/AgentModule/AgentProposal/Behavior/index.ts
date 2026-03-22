import { AgentProposal, ProposalStatus } from "@Database/entities/agents/contracts/Agents";
import { OrgParams, ProposalParams, DecideProposalBody } from "@Validators/contracts/AgentDefinitionValidators";
import { Behavior, DambaApi } from "@Damba/v2/service/DambaService";
import { DEvent } from "@Damba/v2/service/DEvent";

// Replace with your real Architecture Versioning call
async function applyAstPatchToArchitecture(_api: DambaApi | undefined, _orgId: string, _patch: any) {
  return { newArchitectureVersionId: "TODO" };
}

export const decideProposalBehavior: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const repo = api?.DRepository();
    const { orgId } = OrgParams.parse(e.in.params);
    const { proposalId } = ProposalParams.parse(e.in.params);
    const { decision } = DecideProposalBody.parse(e.in.body);

    const proposal = await repo?.DGet1<AgentProposal>(AgentProposal, {
      where: { id: proposalId },
    });
    if (!proposal) throw new Error("Proposal not found");
    if (proposal.status !== ProposalStatus.Proposed) throw new Error("Proposal already decided");

    if (decision === "accept") {
      const result = await applyAstPatchToArchitecture(api, orgId, proposal.patch);

      proposal.status = ProposalStatus.Accepted;
      proposal.decidedByUserId = e.in.payload.id ?? null;
      proposal.decidedAt = new Date();

      // ✅ service entity is AgentProposal => api.DSave OK
      await api?.DSave(proposal);

      return e.out.send({ proposal, ...result });
    }

    proposal.status = ProposalStatus.Rejected;
    proposal.decidedByUserId = e.in.payload.id ?? null;
    proposal.decidedAt = new Date();
    await api?.DSave(proposal);

    return e.out.send({ proposal });
  };
};
