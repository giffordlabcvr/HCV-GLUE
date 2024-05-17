# HCV-GLUE: Phylogenomic Analysis of Hepatitis C Virus

## Overview

HCV-GLUE is a sequence-oriented resource for comparative genomic analysis of hepatitis C virus (HCV), developed using the [GLUE](https://github.com/giffordlabcvr/gluetools) software framework. It includes a web interface that can be used to create an HCV-GLUE web-server.

HCV-GLUE contains HCV feature definitions, annotated reference sequences for all HCV genotypes and subtypes, and heirarchically ordered multiple sequence alignments.

This **HCV-GLUE** base project can be extended with additional layers, openly availabe via GitHub, including:

  - **[NCBI-HCV-GLUE](https://github.com/giffordlabcvr/NCBI-HCV-GLUE)**: extends HCV-GLUE through the incorporation of all HCV sequence data published in NCBI GenBank.
  - **[PHE-HCV-DRUG-RESISTANCE ](https://github.com/giffordlabcvr/PHE-HCV-DRUG-RESISTANCE)**: a drug resistance-focused extension incorporating an analysis tool that provides genotypic assessment of drug resistance/susceptibility.

A web instance of HCV-GLUE incorporating both these extension layers is hosted by the University of Glasgow, and can be accessed here **[here](http://hcv-glue.cvr.gla.ac.uk/)**.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Key Features

- **GLUE Framework Integration**: Built on the GLUE software framework, HCV-GLUE offers an extensible platform for efficient, standardized, and reproducible computational genomic analysis of influenza viruses.

- **Phylogenetic Structure**: The data in HCV-GLUE is organized in a phylogenetically-structured manner, allowing users to explore evolutionary relationships easily.

- **Automated Updates**: HCV-GLUE provides an automatically-updated collection of influenza sequence data, ensuring users have access to the latest information for their analyses.

- **Rich Annotations**: Each sequence is annotated with gene features, enabling rigorous comparative genomic analysis related to conservation, adaptation, structural context, and genotype-to-phenotype associations.

- **Automated Genotyping**: HCV-GLUE can perform automated genotyping of HCV sequences (including subgenomic sequences) using GLUE's maximum likelihood clade assignment (MLCA) algorithm, as described [here](https://doi.org/10.1186/s12859-018-2459-9).

- **Web user interface**: The web user interface that supports online browsing of the HCV-GLUE sequence database, and provides web access to an in-built sequence analysis tool (provides genotyping, analysis and visualisation of submitted FASTA sequences).


## Installation

If you have not done so already, install the GLUE software framework by following the [installation instructions](http://glue-tools.cvr.gla.ac.uk/#/installation) on the GLUE web site: 

Note the HCV-GLUE project has a layered structure. This approach simplifies project management because it allows data items that are likely to be used across a wide range of analysis contexts to be maintained separately from those only required for more specialized purposes. The ‘base’ layer of HCV-GLUE contains only a minimal set of essential data items required for comparative analysis.

To build the base (or 'core') project, download the HCV-GLUE repository, navigate into the top-level directory, and start the GLUE command line interpreter, e.g.:

```
rob$ gluetools.sh

GLUE Version 1.1.107
Copyright (C) 2015-2020 The University of Glasgow
This program comes with ABSOLUTELY NO WARRANTY. This is free software, and you
are welcome to redistribute it under certain conditions. For details see
GNU Affero General Public License v3: http://www.gnu.org/licenses/

Mode path: /
GLUE>
```

At the GLUE command prompt, run the 'buildCoreProject.glue' file as follows:

`GLUE> run file hcvProject.glue`

This will build the base project, which contains a minimal set of HCV 'reference' sequences. The base project can be extended to incorporate all HCV sequences in GenBank by downloading the extension project [NCBI-HCV-GLUE](https://github.com/giffordlabcvr/NCBI-HCV-GLUE).

## Usage

GLUE contains an interactive command line environment focused on the development and use of GLUE projects by bioinformaticians. This provides a range of productivity-oriented features such as automatic command completion, command history and interactive paging through tabular data. 

For detailed instructions on how to use HCV-GLUE for your comparative genomic analysis, refer to the GLUE software environment's [reference documentation](http://glue-tools.cvr.gla.ac.uk/).

## Contributing

We welcome contributions from the community! If you're interested in contributing to HCV-GLUE, please review our [Contribution Guidelines](./md/CONTRIBUTING.md).

[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](./md/code_of_conduct.md) 

## License

The project is licensed under the [GNU Affero General Public License v. 3.0](https://www.gnu.org/licenses/agpl-3.0.en.html)

## Contact

For questions, issues, or feedback, please contact us at [gluetools@gmail.com](mailto:gluetools@gmail.com) or open an issue on the [GitHub repository](https://github.com/giffordlabcvr/HCV-GLUE/issues).

