import useFetch from "./useFetch";

class Api {
  //filter
  args = (data) =>
    `?nip=${data.nip}&date_begin__gte=${data.date_begin_first}&date_begin__lte=${data.date_begin_second}&date_end__gte=${data.date_end_first}&date_end__lte=${data.date_end_second}&name__icontains=${data.name}&salesman__icontains=${data.salesman}&address__icontains=${data.address}&contract_number__icontains=${data.contract_number}&annex=${data.annex}&distance=${data.distance}&latitude=${data.latitude}&longitude=${data.longitude}`;
  argsToFix = (data) => `?salesman=${data.salesman}&branch=${data.branch}`;
  //GET
  api = useFetch();
  getContracts = async () => await this.api(`/api/contracts/`);
  getFilteredContracts = async (data) =>
    await this.api(`/api/contracts/filter/${this.args(data)}`);

  getFilteredToFix = async (data) =>
    await this.api(`/api/contracttofix/filter/${this.argsToFix(data)}`);

  getNip = async () => await this.api(`/api/nip/`);
  getAnnexes = async () => await this.api(`/api/annex/`);
  getError = async () => await this.api(`/api/error/`);
  getStats = async () => await this.api(`/api/stats/`);
  getContractsToFix = async () => await this.api(`/api/contracttofix/`);

  //POST
  addAnnex = async ({ nip }) =>
    await this.api(`/api/annex/`, {
      method: "POST",
      body: JSON.stringify(nip),
    });
  editContract = async (contract, id) =>
    this.api(`/api/contract/${id}`, {
      method: "POST",
      body: JSON.stringify(contract),
    });
  editContractToFix = async (contract, pk) =>
    this.api(`/api/contracttofix/${pk}/`, {
      method: "POST",
      body: JSON.stringify(contract),
    });

  newContracts = async (contract) =>
    this.api(`/api/contracts/`, {
      method: "POST",
      body: JSON.stringify(contract),
    });
  addPPEs = async (ppe) =>
    this.api(`/api/ppe/`, { method: "POST", body: JSON.stringify(ppe) });
  newContractToFix = async (data) =>
    this.api(`/api/contracttofix/`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  addNip = async (data) =>
    this.api(`/api/nip/`, { method: "POST", body: JSON.stringify(data) });
  updateNip = async (data) =>
    this.api(`/api/nip/${data.id}/`, {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify(data),
    });

  //DELETE
  deleteNip = async (id) => this.api(`/api/nip/${id}`, { method: "DELETE" });
  deleteContractToFix = async (id) =>
    this.api(`/api/contracttofix/${id}`, { method: "DELETE" });
}
export default Api;
