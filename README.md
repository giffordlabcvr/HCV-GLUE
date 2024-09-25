# HCV-GLUE: Phylogenomic Analysis of Hepatitis C Virus

## Overview

HCV-GLUE is a sequence-oriented resource for comparative genomic analysis of hepatitis C virus (HCV), developed using the [GLUE](https://github.com/giffordlabcvr/gluetools) software framework. It includes a web interface that can be used to create an HCV-GLUE web-server.

Hepatitis C virus (HCV) is a bloodborne RNA virus that primarily targets the liver, causing both acute and chronic hepatitis. Classified under the *Hepacivirus* genus within the *Flaviviridae* family, HCV is mainly transmitted through contact with infected blood. If left untreated, infection can lead to serious liver complications, such as cirrhosis and liver cancer. Direct-acting antiviral medications have dramatically improved cure rates and hold the potential to eliminate the virus. However, achieving global elimination faces significant challenges

GLUE is an open, integrated software toolkit designed for storing and interpreting sequence data. It supports the creation of bespoke projects, incorporating essential data items for comparative genomic analysis, such as sequences, multiple sequence alignments, genome feature annotations, and other associated data.

Projects are loaded into the GLUE "engine," forming a relational database that represents the semantic relationships between data items. This foundation supports systematic comparative analyses and the development of sequence-based resources.

**HCV-GLUE** contains HCV feature definitions, annotated reference sequences for all HCV genotypes and subtypes, and heirarchically ordered multiple sequence alignments. It also contains functionality for assigning HCV sequences (including sub-genomic sequences) to subtypes and genotypes, using a maximium likelihood-based genotyping protocol.

This HCV-GLUE project can be extended with additional layers, openly available via GitHub, including:

  - **[NCBI-HCV-GLUE](https://github.com/giffordlabcvr/NCBI-HCV-GLUE)**: extends HCV-GLUE through the incorporation of all HCV sequence data published in NCBI GenBank.
  - **[PHE-HCV-DRUG-RESISTANCE](https://github.com/giffordlabcvr/PHE-HCV-DRUG-RESISTANCE)**: a drug resistance-focused extension incorporating an analysis tool that provides genotypic assessment of drug resistance/susceptibility.
  - **[HCV-NABS](https://github.com/giffordlabcvr/HCV-NABS)**: an extension for analysing neutralising antibody binding sites in HCV.


A web instance of HCV-GLUE incorporating both these extension layers is hosted by the University of Glasgow, and can be accessed **[here](http://hcv-glue.cvr.gla.ac.uk/)**.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Key Features

- **GLUE Framework Integration**: Built on the GLUE software framework, HCV-GLUE offers an extensible platform for efficient, standardized, and reproducible computational genomic analysis of HCV.

- **Phylogenetic Structure**: The data in HCV-GLUE is organized in a phylogenetically-structured manner, allowing users to explore evolutionary relationships easily.

- **Automated Updates**: HCV-GLUE provides an automatically-updated collection of HCV sequence data, ensuring users have access to the latest information for their analyses.

- **Rich Annotations**: Annotated reference sequences enable detailed and rigorous comparative genomic analysis related to conservation, adaptation, structural context, and genotype-to-phenotype associations.

- **Automated Genotyping**: HCV-GLUE can perform automated genotyping of HCV sequences (including subgenomic sequences) using GLUE's maximum likelihood clade assignment (MLCA) algorithm, as described [here](https://doi.org/10.1186/s12859-018-2459-9).

- **Web user interface**: The web user interface that supports online browsing of the HCV-GLUE sequence database, and provides web access to an in-built sequence analysis tool (provides genotyping, analysis and visualisation of submitted FASTA sequences).

- **Exploratory and operational**: The GLUE framework allows sequence-based resources to be used for exploratory work in a research setting, as well as operational work in a public or animal health setting. For example, HCV-GLUE can be used to [faciliate HCV research](https://doi.org/10.3389/fimmu.2018.01470), or to generate standardised sequence analysis reports (e.g. [drug resistance analysis](http://hcv-glue.cvr.gla.ac.uk/exampleReports/ngsData.html)). 


## Installation

Please visit **[the HCV GLUE web page](http://hcv-glue.cvr.gla.ac.uk/#/aboutGlueProject)** for instructions on installing HCV-GLUE.

## Usage

GLUE contains an interactive command line environment focused on the development and use of GLUE projects by bioinformaticians. This provides a range of productivity-oriented features such as automatic command completion, command history and interactive paging through tabular data. Some examples are provided **[here](http://hcv-glue.cvr.gla.ac.uk/#/aboutGlueProject)**.

For detailed instructions on how to use HCV-GLUE for your comparative genomic analysis, refer to the GLUE software environment's [reference documentation](http://glue-tools.cvr.gla.ac.uk/).

## Contributing

We welcome contributions from the community! If you're interested in contributing to HCV-GLUE, please review our [Contribution Guidelines](./md/CONTRIBUTING.md).

[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](./md/code_of_conduct.md) 

## License

The project is licensed under the [GNU Affero General Public License v. 3.0](https://www.gnu.org/licenses/agpl-3.0.en.html)

## Contact

For questions, issues, or feedback, please contact us at [gluetools@gmail.com](mailto:gluetools@gmail.com) or open an issue on the [GitHub repository](https://github.com/giffordlabcvr/HCV-GLUE/issues).

