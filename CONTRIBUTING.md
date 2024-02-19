# Contributing

When contributing components, do discuss with the team managing this repository.

Do also adhere to the guidelines mentioned below.

-   <a href="#convention">File / folder conventions</a>
-   <a href="#contributor">As a contributor</a>
    -   <a href="#creating-branch">Creating a branch</a>
    -   <a href="#adding-modules">Adding modules</a>
    -   <a href="#pull-request">Creating pull requests</a>
-   <a href="#repo-owner">As a repository owner</a>
    -   <a href="#versioning">Version management</a>
    -   <a href="#documenting-change">Documenting change</a>
    -   <a href="#updating">How to update this library?</a>

---

<a id="convention"></a>

## Conventions

-   All folder and file names should be kebab-lower-cased
-   Adhere to the folder structure
-   Instead of introducing a catch-all utility folder, separate independent utilities in their own top-level modules as much as possible

---

<a id="contributor"></a>

## As a contributor

<a id="creating-branch"></a>
<br />

### **1. Creating a branch**

Now that you are starting off, first create a branch with a short and easy description in **kebab-case**
e.g. `add-json-path-pattern`

<a id="adding-modules"></a>
<br />

### **2. Adding modules**

Code is organised into modules.

```
└── src
    ├── module-name
    │  ├── __tests__
    │  ├── module-name.ts
    │  ├── types.ts
    │  └── index.ts
    └── index.ts
```

Where

-   `module-name.ts` contains the src. It can be split further into subfolders for maintainability.
-   `types.ts` contains the type definitions which should be re-exported in `index.ts`
-   `index.ts` is the exportable file of the module which should be re-exported in the `src/index.ts`

Tests are co-located with their modules.

<a id="pull-request"></a>
<br />

### **3. Creating pull requests**

Once you have committed and pushed your code, you are to create a pull request to have it approved to be in the `master` branch.

Add a meaningful title to your pull request and follow the template provided.

---

<a id="repo-owner"></a>
<br />

## As a repository owner

<a id="versioning"></a>
<br />

### **1. Version management**

There are different types of versions that we can include in the frontend engine.

For larger features/changes such as migrations, we would introduce
alpha versions to inform others of the potential breakages in these versions. We can denote alpha versions as such

```
v1.x.x-alpha.x

e.g.
v1.2.0-alpha.2
```

Where `v1.2.0` is the version that we will eventually release to.

> It is advisable to work in a separate branch for alpha releases so as not to disrupt the `master` branch which is
> always a reflection of the latest in production

For all other changes, we follow the **canary release system**. This allows us to test new features/fixes before we roll out the official version to the other users. The version tags are as such:

-   `canary` v1.0.1-canary.1
-   `stable` v1.0.1

In terms of versioning, you may follow the guidelines as such:

-   If it is breaking change (not backward compatible), increase the major version (e.g. `x.0.0`)
-   If it is a regular enhancement, increase the minor version (e.g. `1.x.0`)
-   If it is a bug fix, increase thepatch version (e.g. `1.1.x`)

<a id="documenting-change"></a>
<br />

### **2. Documenting change**

Like all libraries, documenting changes are extremely important for users to note of the changes being made in the code. This is done in the [Changelog Wiki](https://github.com/LifeSG/web-frontend-engine/wiki/Changelog). Some principles include:

-   Indicate version number and date of release
-   State the type if it is `New features` or `Bug fixes`
-   State purpose clearly. Indicate if it is Breaking change by indicating the tag `[BREAKING]`
-   If you would warn users of the change you can indicate using the tag `[WARNING]`

### **3. How to update this library?**

1. Create a branch with a signature as such `bump-v6.0.1-canary.1`
2. Update the version number in `package.json` and `package-lock.json`
3. Create a pull request to have it merged
4. Update the [Changelog Wiki](https://github.com/LifeSG/web-frontend-engine/wiki/Changelog)
5. Code owner will proceed to create a release
