import json, os, cv2, time, re, sys, string
import spacy

sys.path.append("image_text_reader/") 
import read_image as ri

print("Loading spacy corpus")
# nlp = spacy.load("en_core_web_md") 
nlp = spacy.load("en_core_web_sm") 
print("Finished loading spacy corpus")

pattern = re.compile('[\W_]+')

def proportion_nonalphanumeric(s): 
    numbers = sum(c.isdigit() for c in s)
    words   = sum(c.isalpha() for c in s)
    spaces  = sum(c.isspace() for c in s)
    others  = len(s) - numbers - words - spaces
    return others / float(len(s)) if s else 0.0

def clean_text(s): 
    s = s.strip()
    l = s.split("\n")
    l = [k for k in l
           if len(k) > 0 
           and proportion_nonalphanumeric(k) < 0.3
           and len(''.join(k.split(" "))) > 2]
    l = [' '.join([pattern.sub('', m) for m in k.split(" ")]) for k in l]
    l = [" ".join(k.split()) for k in l]
    return l

def preprocess_hist(slide_images_path, slide_hist_json_out_path): 
	print("Preprocessing histograms")
	color_histogram_json = {}

	fns = [slide_images_path + fn for fn in os.listdir(slide_images_path) if fn[0] != "."]

	for fn in fns: 
	    start = time.time()
	    
	    name = fn.split(".")[-2]
	    color_histogram_json[name] = {}
	    
	    img = cv2.imread(fn)
	    color = ('b','g','r')
	    
	    times = []
	    
	    for i,col in enumerate(color):
	        
	        histr = cv2.calcHist([img],[i],None,[256],[0,256])
	        color_histogram_json[name][col] = histr.tolist()
	    
	    times.append(time.time() - start)
	    
	with open(slide_hist_json_out_path, "w") as f: 
	    json.dump(color_histogram_json, f, indent=4)
	        
	print("Average time per slide:", sum(times)/ float(len(times)) if times else 0.0)
	print("Done! Saved to:", slide_hist_json_out_path)

def preprocess_text(slide_images_path, slide_text_out_path, slide_text_json_out_path): 
	print("Preprocessing text")
	fns = [slide_images_path + fn for fn in os.listdir(slide_images_path) if fn[0] != "."]
	text_fns = []

	print("Number of files:", len(fns))

	times = []
	for fn in fns: 
	    start = time.time()

	    print(fn)
	    out_fn = slide_text_out_path + fn.split(".")[-2] + ".txt"
	    text_fns.append(out_fn)

	    if not os.path.exists(out_fn): 
		    text = ri.read_image_from_file(fn)

		    if text: 
		        if os.path.exists(slide_text_out_path): 
		            print("Path exists!")
		        else: 
		            import subprocess
		            subprocess.call(["mkdir", slide_text_out_path])

		        with open(out_fn, "w") as f: 
		            f.write(text)
		    end = time.time() - start
		    print("Time:", end)
		    
		    times.append(end)

	text_json = {}

	for fn in text_fns: 
	    name = fn.split(".")[-2]
	    with open(fn) as f: 
	        text_json[name] = f.read().strip()
	        text_json[name] = clean_text(text_json[name])
	        
	with open(slide_text_json_out_path, "w") as f: 
	    json.dump(text_json, f, indent=4)
	    
	print("Average time:", sum(times)/float(len(times)) if times else 0.0)

	new_json = {}
	with open(slide_text_json_out_path) as fj: 
	    
	    j = json.load(fj)
	    keys = j.keys()
	    
	    for key in keys: 

	    	# only works with medium corpus size
	        # txt_lines = [[m.lemma_ for m in nlp(k) if m.prob > -20.0] for k in j[key]]

	        txt_lines = [[m.lemma_ for m in nlp(k)] for k in j[key]]
	        txt_lines = [k for k in txt_lines if k]
	        new_json[key] = txt_lines
	        
	spacy_json_fn = slide_text_json_out_path.split(".")[0] + "-spacy-sm.json"

	with open(spacy_json_fn, "w") as f: 
	    json.dump(new_json, f, indent=4)

	print("Done! Saved to:", spacy_json_fn)
	print()
	print()

def main():
    # parse command line options
   	args = sys.argv[1:]

   	slide_images_path = args[0]
   	slide_text_out_path = args[1]
   	slide_text_json_out_path = args[2]
   	slide_hist_json_out_path = args[3]

   	preprocess_text(slide_images_path, slide_text_out_path, slide_text_json_out_path)
   	preprocess_hist(slide_images_path, slide_hist_json_out_path)

   	spacy_json_fn = slide_text_json_out_path.split(".")[0] + "-spacy-sm.json"
   	print(slide_images_path, slide_text_out_path, 
   		slide_hist_json_out_path, spacy_json_fn)

   	print("Finished!")

if __name__ == "__main__":
    main()