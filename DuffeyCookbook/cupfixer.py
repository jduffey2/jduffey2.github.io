import os

directoryList = os.listdir('C:\\Users\\jduff\\Documents\\Cookbook')

for file in directoryList:
    replacedContent = ""

    if file.endswith("txt"):
        filename = os.path.splitext(file)[0]
        f = open(file, "r")

        for line in f:
            if line[0] == '-':
                newline = line.replace("cups","c.").replace("cup","c.")
                replacedContent = replacedContent + newline
            else:
                replacedContent = replacedContent + line

        f.close() 

        write_file = open(file,"w")
        write_file.write(replacedContent)
        write_file.close()
    else:
        continue