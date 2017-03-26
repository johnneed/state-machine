# State Machine Example


# How to get this app running

1. Install Git. Go to the Git website https://git-scm.com/. Download Git and follow the install instructions for your operating system.
2. Verify that Git is installed. Open a terminal and type **git --version**. You should see something like this:

    **git version 2.10.1 (Apple Git-78)**

3. Install Node.  You'll need Node to run the build process.  Go to the Node Website https://nodejs.org/en/. Download Node and follow the instructions.

4. Verify that Git is installed. In your terminal type **node -v**. You should see something like this:

    **v7.3.0**
    
5. Sign into Github or create a new Github account: https://github.com/join?source=header-home

4. In your terminal program, navigate to where you want your code to live by using the **cd** command. For instance you navigate to your profile using **cd ~/**. 

5. Create a folder if you need to.  For instance you can create a folder called "my-projects" like this **mkdir my-projects** and then navigate into that folder **cd my-projects**

6. Clone this repository. In the Terminal type **git clone https://github.com/johnneed/state-machine.git**  Git will download this code and create a new folder called *state-machine*

7. Navigate into the *state-machine* folder **cd state-machine**

8. Install local dependencies using Node Package Manager *npm*.  Type **npm install**

9. We'll need a few global dependencies.  Type **npm install -g grunt-cli**  This will install the Command Line Interface for Grunt, which is the tool we use to build our application.  You may need to restart your terminal after this runs.

10. Build the application.  Navigate back to *state-machine* folder if you need to and type *grunt*. This will build your application, launch a websserver and open your application in browser.
 
