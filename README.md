HCV-GLUE: Comparative Genomics of Hepatitis C Virus
===================================================

<img src="md/glue-logo.png" align="right" alt="" width="280"/>

### Overview

HCV-GLUE is a sequence-oriented resource for comparative genomic analysis of hepatitis C virus (HCV), developed using the [GLUE](https://github.com/giffordlabcvr/gluetools) software framework.

GLUE is an open, integrated software toolkit designed for storing and interpreting sequence data. It supports the creation of bespoke projects, incorporating essential data items for comparative genomic analysis, such as sequences, multiple sequence alignments, genome feature annotations, and other associated data.

Projects are loaded into the GLUE "engine," forming a relational database that represents the semantic relationships between data items. This foundation supports systematic comparative analyses and the development of sequence-based resources.

HCV-GLUE provides a command-line interface (CLI) and can be installed locally, opting either for a **[Docker-based](https://github.com/giffordlabcvr/HCV-GLUE/wiki/Docker-Installation)** or **[native installation](https://github.com/giffordlabcvr/HCV-GLUE/wiki/Native-Installation)**.

* * * * *

### Web Access

You can also use some of HCV-GLUE's functionality via its web UI.

**A web instance of HCV-GLUE incorporating extension layers is hosted by the University of Glasgow and can be accessed [here](http://hcv-glue.cvr.gla.ac.uk)**.

* * * * *

### Key Features

-   **GLUE Framework Integration**: Built on the GLUE software framework, HCV-GLUE offers an extensible platform for efficient, standardized, and reproducible computational genomic analysis of HCV.

-   **Phylogenetic Structure**: The data in HCV-GLUE is organized in a phylogenetically-structured manner, allowing users to explore evolutionary relationships easily.

-   **Automated Updates**: HCV-GLUE provides an automatically-updated collection of HCV sequence data, ensuring users have access to the latest information for their analyses.

-   **Rich Annotations**: Annotated reference sequences enable rigorous comparative genomic analysis related to conservation, adaptation, structural context, and genotype-to-phenotype associations.

-   **Automated Genotyping**: HCV-GLUE can perform automated genotyping of HCV sequences (including subgenomic sequences) using GLUE's maximum likelihood clade assignment (MLCA) algorithm, as described [here](https://doi.org/10.1186/s12859-018-2459-9).

-   **Web user interface**: The [HCV-GLUE-WEB](https://github.com/giffordlabcvr/HCV-GLUE-WEB) extension project defines a web user interface that supports online browsing of the HCV-GLUE sequence database and provides web access to an in-built sequence analysis tool (providing genotyping, analysis, and visualization of submitted FASTA sequences).

-   **Exploratory and operational**: The GLUE framework allows sequence-based resources to be used for exploratory work in a research setting, as well as operational work in a public health setting.

* * * * *

### Extension Layers

This **HCV-GLUE** base project can be extended with additional layers, openly available via GitHub, including:

-   **[NCBI-HCV-GLUE](https://github.com/giffordlabcvr/NCBI-HCV-GLUE)**: Extends HCV-GLUE through the incorporation of all HCV sequence data published in NCBI GenBank.
-   **[PHE-HCV-DRUG-RESISTANCE](https://github.com/giffordlabcvr/PHE-HCV-DRUG-RESISTANCE)**: A drug resistance-focused extension incorporating an analysis tool that provides genotypic assessment of drug resistance/susceptibility.
-   **[HCV-NABS](https://github.com/giffordlabcvr/HCV-NABS)**: An extension for analyzing neutralizing antibody binding sites in HCV.

* * * * *


Installation
------------

To install HCV-GLUE, follow the instructions provided in the **[User Guide](https://github.com/giffordlabcvr/HCV-GLUE/wiki)**.

You can choose between:

-   **[Docker-based installation](https://github.com/giffordlabcvr/HCV-GLUE/wiki/Docker-Installation)** for ease of deployment.
-   **[Native installation](https://github.com/giffordlabcvr/HCV-GLUE/wiki/Native-Installation)** for traditional setup.

HCV-GLUE can be installed as a prebuilt database for quick setup or constructed from scratch for more customization.

* * * * *

Data Sources
------------

HCV-GLUE relies on the following data sources:

-   [NCBI Nucleotide](https://www.ncbi.nlm.nih.gov/nuccore)
-   [NCBI Taxonomy](https://www.ncbi.nlm.nih.gov/taxonomy)

* * * * * 
