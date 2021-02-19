# AppMap for Visual Studio Code

Generate accurate software design diagrams with AppMap. In less than 2 minutes you can go from installing this extension to viewing diagrams in your IDE, because AppMap creates diagrams automatically by executing functional test cases. AppMap helps you:

- Onboard to code architecture, with no extra work for the team 
- Conduct code and design reviews using live and accurate data
- Troubleshoot hard-to-understand bugs using a "top-down" approach

Each interactive diagram links directly to the source code, and the information is easy to share.

![AppMap diagrams](https://vscode-appmap.s3.us-east-2.amazonaws.com/media/002.gif "AppMap diagrams")

## Summary of features

- UML-inspired Depenency Map that displays key application components and how they are interrelated during execution 
- Execution Trace diagrams that visualize code and data flows
- List of Webservices generated automatically from test cases
- List of SQL queries generated automatically from test cases
- Search for class, package or function
- Code linkage of the diagram to the source code it relates to

## Contact us

Join us on [Discord](https://discord.com/invite/N9VUap6) or [GitHub](https://github.com/applandinc/vscode-appland).

# Getting started

AppMap records behavior of running code as [AppMap files](https://github.com/applandinc/appmap) during test execution and visualizes them in interactive diagrams.

![Getting started steps](https://vscode-appmap.s3.us-east-2.amazonaws.com/media/000.png "Getting started steps")

Here's how to get going:

## 1. Install the [AppMap for VS Code extension](https://marketplace.visualstudio.com/items?itemName=appland.appmap)


## 2. Install the AppMap client for your language

To generate AppMap files, an AppMap client must be installed and configured for your project. 

### Ruby

The `appmap` Ruby gem is on GitHub at [https://github.com/applandinc/appmap-ruby](https://github.com/applandinc/appmap-ruby).

[View installation instructions for `appmap-ruby`](https://github.com/applandinc/appmap-ruby/blob/master/README.md#installation)

![AppMap extension for VSCode - quick and easy setup](https://vscode-appmap.s3.us-east-2.amazonaws.com/media/AppMap+extension+for+VSCode+-+quick+and+easy+setup.gif)

**Supported languages and frameworks**

Ruby on Rails, MiniTest, RSpec, Cucumber, and more.

### Java

The `appmap` Java agent is on GitHub at [https://github.com/applandinc/appmap-java](https://github.com/applandinc/appmap-java).

[View installation instructions for `appmap-java`](https://github.com/applandinc/appmap-java/blob/master/README.md)

**Supported languages and frameworks**

Spring, JUnit, TestNG, and more.

## 3. Open an `*.appmap.json` file

Open an AppMap file in Visual Studio Code to view diagrams of the recording.

## Using the AppMap diagrams

Use AppMap extension command `AppMap: Open most recently modified AppMap` to open the AppMap file that has most recently changed. When you have run a single test, this will be the AppMap for that test.

![Open most recently modified AppMap](https://vscode-appmap.s3.us-east-2.amazonaws.com/media/007.png "Open most recently modified AppMap")

Alternatively, open any generated `.appmap.json` file directly from the file tree navigator.

Depending on the test run and functionality covered, you should see a viewer with a diagram similar to this one:

![Dependency Map](https://vscode-appmap.s3.us-east-2.amazonaws.com/media/001.gif "Dependency Map")

### Details
The “Details” panel on the left hand side will be used when you click on something, such as a package or class. 

### Filters
“Filters” is used to type in the name of a particular object, such as a class, and focus the diagrams on that class. When you are brand new to the code base, you may not have any particular class names in mind, but as you use this tool in the future, perhaps to troubleshoot a bug, you may have a better idea of exactly what you want to look at, and Filters can help with that. 

### Dependency Map
This is a view of the code, grouped into classes and packages, that was actually executed by the test case. When a class calls another class, the result is a link (edge) connecting them, with an arrow denoting the call direction. Keep in mind, this data isn’t coming just from a static analysis of the dependencies in the code (e.g. import and require statements). It’s coming from the actual execution trace through the code base. 

SQL queries are denoted by the database icon. You can get specific details about SQL by switching to the Trace view.

### Trace
Click on a class in the Dependency Map, then choose one of the functions, then choose an Event in which that function is used, then click on "Show in Trace view"

This will open the Trace view. 

Each node (box) in the Trace view represents a specific HTTP server request, function call, or SQL query which occurred in the test case. You can think of it like having the data from a debugger, but you can jump to any location in the call graph. The Trace view flows from left to right and top to bottom as the program moves forward in time. 

Trace sub-graphs can be expanded and collapsed for easier navigation. 

![Trace navigation](https://vscode-appmap.s3.us-east-2.amazonaws.com/media/003.gif "Trace navigation")


### Interacting with the diagrams

The diagrams are fully interactive; they aren’t static pictures like UML. You can:
- Expand and collapse packages.
- Click on edges to view detailed information about dependencies between components.
- Click on classes to view detailed information about that class.
- List the functions of a class which are used by the test case.
- Explore callers and callees.
- View variable names and values at any point in the code flow, clicking on a variable in the Trace view
- View SQL queries.
- Open source code right to the line of any particular function, by clicking on “View source"

<a href="https://www.loom.com/share/327f17cf25de499e9254bde366137306"><p>Watch demonstration video</p><img style="max-width:300px;" src="https://cdn.loom.com/sessions/thumbnails/327f17cf25de499e9254bde366137306-with-play.gif"></a>

## Sharing

### Record and share videos and screenshots

The easiest way to share the diagrams with a wider audience is via screencasts, recorded screen videos and screenshots. 
Here are some tips:
- Use the built-in [screencast mode](https://dzhavat.github.io/2019/09/18/screencast-mode-in-vs-code.html) that will help your audience better follow your mouse and keyboard actions
- There are many great tools for recording and sharing screen videos. To mention a few:
    - [Loom](https://www.loom.com/), a favorite tool in many teams
    - [ScreenToGif](https://www.screentogif.com), a simple yet powerful OSS screen recorder
    - The Marketplace [lists extensions for screen recording](https://marketplace.visualstudio.com/search?term=screen%20recorder&target=VSCode&category=All%20categories&sortBy=Relevance)


### Share AppMap files for viewing in VSCode

Generated AppMap files can be viewed by others with the AppMap extension. So, one option for sharing is to simply send the `appmap.json` file to your colleague.

### Share AppMap files in the SaaS [https://app.land](https://app.land) sandbox
[App.Land](https://app.land) is a free sandbox that can be rapidly used as an AppMap repository and as a collaboration and sharing tool for your team. 

1. [Sign-up](https://app.land) for app.land, create an account for your organization and invite others to join
1. [Follow these instructions](https://app.land/setup/cli) to install CLI tools and upload your AppMap files to the server
2. Open and share your AppMaps (called scenarios in the app.land UI) from the UI. You can make the shareable links private - accessible for members of your organization only, or public.

## Advanced configuration

### Refine your AppMaps for more impactful results

Recording large, complex applications can lead to acquisition of extraneous utility details that are not valuable for understanding how the application architecture works. If your AppMaps get too large, fine-tune the `appmap.yml` configuration file:

1. [Download and install AppLand CLI tools](https://app.land/setup/cli#install-command-line-tools) (only follow step 1 in the instructions)
2. [Refine your AppMap configuration](https://github.com/applandinc/appland-cli/blob/master/doc/refine-appmaps.md)

Then re-run the tests to record new AppMap files with the updated configuration.

### Share AppMap customizations with your team

Simply share your `appmap.yml` configuration file with others. Use of a git repository is recommended for tracking and sharing updates among members of your team. 

# Troubleshooting

## What if I don’t have test cases?

AppLand has other solutions which help you profile and automatically diagram software through dynamic analysis, without relying on test cases.  We have also hosted analytics solutions to analyze code architecture over entire codebases and across multiple releases.  To learn more about these solutions go to [AppLand.com](https://appland.com/) or [contact us](http://info@app.land).

## Q & A

Please visit the [AppMap wiki](https://github.com/applandinc/vscode-appland/wiki) in GitHub.

## Contact us for assistance

Join us on [Discord](https://discord.com/invite/N9VUap6) or [GitHub](https://github.com/applandinc/vscode-appland).


# About AppMap

How AppMap technology works: [appland.org](https://appland.org).
