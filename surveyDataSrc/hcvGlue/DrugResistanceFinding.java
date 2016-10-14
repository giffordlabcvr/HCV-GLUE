package hcvGlue;

public class DrugResistanceFinding {

	String drug;
	String gene;
	int codon;
	String substitutions;
	String clade;
	Double minEcFoldChange;
	Double maxEcFoldChange;
	String reference;
	
	public DrugResistanceFinding(String drug, String gene, int codon,
			String substitutions, String clade, Double minEcFoldChange,
			Double maxEcFoldChange, String reference) {
		super();
		this.drug = drug;
		this.gene = gene;
		this.codon = codon;
		this.substitutions = substitutions;
		this.clade = clade;
		this.minEcFoldChange = minEcFoldChange;
		this.maxEcFoldChange = maxEcFoldChange;
		this.reference = reference;
	}

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((clade == null) ? 0 : clade.hashCode());
		result = prime * result + codon;
		result = prime * result + ((drug == null) ? 0 : drug.hashCode());
		result = prime * result + ((gene == null) ? 0 : gene.hashCode());
		result = prime * result
				+ ((maxEcFoldChange == null) ? 0 : maxEcFoldChange.hashCode());
		result = prime * result
				+ ((minEcFoldChange == null) ? 0 : minEcFoldChange.hashCode());
		result = prime * result
				+ ((reference == null) ? 0 : reference.hashCode());
		result = prime * result
				+ ((substitutions == null) ? 0 : substitutions.hashCode());
		return result;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		DrugResistanceFinding other = (DrugResistanceFinding) obj;
		if (clade == null) {
			if (other.clade != null)
				return false;
		} else if (!clade.equals(other.clade))
			return false;
		if (codon != other.codon)
			return false;
		if (drug == null) {
			if (other.drug != null)
				return false;
		} else if (!drug.equals(other.drug))
			return false;
		if (gene == null) {
			if (other.gene != null)
				return false;
		} else if (!gene.equals(other.gene))
			return false;
		if (maxEcFoldChange == null) {
			if (other.maxEcFoldChange != null)
				return false;
		} else if (!maxEcFoldChange.equals(other.maxEcFoldChange))
			return false;
		if (minEcFoldChange == null) {
			if (other.minEcFoldChange != null)
				return false;
		} else if (!minEcFoldChange.equals(other.minEcFoldChange))
			return false;
		if (reference == null) {
			if (other.reference != null)
				return false;
		} else if (!reference.equals(other.reference))
			return false;
		if (substitutions == null) {
			if (other.substitutions != null)
				return false;
		} else if (!substitutions.equals(other.substitutions))
			return false;
		return true;
	}
	
}
