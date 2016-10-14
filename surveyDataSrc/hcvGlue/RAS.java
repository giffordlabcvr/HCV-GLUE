package hcvGlue;

public class RAS implements Comparable<RAS>{

	String gene;
	Integer codon;
	String substitutions;
	
	public RAS(String gene, Integer codon, String substitutions) {
		super();
		this.gene = gene;
		this.codon = codon;
		this.substitutions = substitutions;
	}

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + codon;
		result = prime * result + ((gene == null) ? 0 : gene.hashCode());
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
		RAS other = (RAS) obj;
		if (codon != other.codon)
			return false;
		if (gene == null) {
			if (other.gene != null)
				return false;
		} else if (!gene.equals(other.gene))
			return false;
		if (substitutions == null) {
			if (other.substitutions != null)
				return false;
		} else if (!substitutions.equals(other.substitutions))
			return false;
		return true;
	}

	@Override
	public int compareTo(RAS other) {
		int comp = this.gene.compareTo(other.gene);
		if(comp != 0) { return comp; }
		comp = this.codon.compareTo(other.codon);
		if(comp != 0) { return comp; }
		comp = this.substitutions.compareTo(other.substitutions);
		return comp; 
	}
	
	
	
	
}
